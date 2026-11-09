// Control de idiomas (Fase 9a). Falla si:
//   1. algún idioma no tiene exactamente las claves de es.json (o difiere en los {{datos}} de algún texto);
//   2. el código usa una clave que no existe en es.json, o es.json tiene claves que nadie usa;
//   3. queda texto en español escrito directo en el código en vez de pasar por t('clave').
// Uso: node scripts/i18n/check.mjs     (desde la raíz de FleteYa-Frontend)
// Para dejar un texto fijo a propósito (un nombre propio, por ejemplo) se escribe "i18n-ignore" en un comentario de esa línea.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const ts = createRequire(path.join(process.cwd(), 'package.json'))('typescript');
const ROOT = process.cwd();
const LANGS = ['en', 'fr', 'it', 'pt', 'de'];
const SOURCE_DIRS = ['presentation', 'data', 'domain', 'di'];
const SOURCE_FILES = ['App.tsx'];
const problems = [];
const fail = (message) => problems.push(message);

// ---------- 1. Idiomas completos
// Los plurales se escriben clave_one / clave_other (y fr, it, pt, es también clave_many): se comparan por la clave base
const PLURAL = /_(zero|one|two|few|many|other)$/;
const base = (key) => key.replace(PLURAL, '');
const flatten = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) =>
  typeof v === 'object' && v !== null ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, String(v)]]);
const load = (lang) => Object.fromEntries(flatten(JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n/locales', `${lang}.json`), 'utf8'))));
const placeholders = (text) => [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort().join(',');
const es = load('es');
// Agrupa por clave base: { 'common.articulos': [textos de _one y _other] }
const group = (data) => {
  const out = {};
  for (const [k, v] of Object.entries(data)) (out[base(k)] ??= []).push(v);
  return out;
};
const esGroups = group(es);
for (const lang of LANGS) {
  const data = load(lang);
  const groups = group(data);
  const missing = Object.keys(esGroups).filter((k) => !(k in groups));
  const extra = Object.keys(groups).filter((k) => !(k in esGroups));
  if (missing.length) fail(`${lang}.json: faltan ${missing.length} claves (p. ej. ${missing.slice(0, 5).join(', ')})`);
  if (extra.length) fail(`${lang}.json: sobran ${extra.length} claves que no están en es.json (p. ej. ${extra.slice(0, 5).join(', ')})`);
  for (const [key, texts] of Object.entries(groups)) {
    if (texts.some((text) => text.trim() === '')) fail(`${lang}.json: ${key} está vacío`);
    // Los datos {{x}} del idioma deben ser los mismos que en español (en los plurales, entre todas sus formas)
    const union = (list) => [...new Set(list.flatMap((text) => placeholders(text).split(',').filter(Boolean)))].sort().join(',');
    if (key in esGroups && union(esGroups[key]) !== union(texts)) fail(`${lang}.json: ${key} no usa los mismos {{datos}} que es.json`);
  }
}

// ---------- 2 y 3. Recorrer el código
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : []);
const files = [...SOURCE_DIRS.flatMap((d) => walk(path.join(ROOT, d))), ...SOURCE_FILES.map((f) => path.join(ROOT, f))];

const usedKeys = new Set();
const ACCENTS = /[áéíóúñÁÉÍÓÚÑ¿¡]/;
const BRANDS = ['Carry', 'Nequi', 'Bancolombia', 'FleteYa', 'Google', 'Wompi', 'PSE'];
const looksSpanish = (s) => {
  const x = s.trim();
  if (!/\p{L}{2,}/u.test(x)) return false;
  if (/^[A-Z][A-Za-z]*(Screen|Navigator)$/.test(x) || BRANDS.includes(x)) return false;
  if (/^(https?:|\/|\.{1,2}\/|#[0-9a-f]{3,8}$|rgba?\(|[a-z]+:\/\/)/i.test(x)) return false;
  if (/^[A-Z0-9_]+$/.test(x)) return false;
  if (!/\s/.test(x)) {
    if (ACCENTS.test(x)) return true;
    if (/^[a-z]/.test(x) || /[_\-/.\d]/.test(x)) return false;
    return true; // palabra suelta con mayúscula inicial: "Mudanza"
  }
  return true;
};

const TEXT_ATTRS = /^(name|variant|color|tone|size|type|icon|testID|style|mode|resizeMode|keyboardType|autoComplete|autoCapitalize|align|initialRouteName|accessibilityRole|textContentType|returnKeyType|behavior|animationType|provider|mapType|presentationStyle)$/;
const SKIP_CALLS = /\.(includes|startsWith|endsWith|indexOf|test|match|replace|split|padStart|padEnd|getItem|setItem|removeItem|save|on|off|emit|onMessage|addEventListener|get|put|post|delete|patch|navigate|push|setOptions|toLocaleString|toLocaleDateString|toLocaleTimeString|getParent|getFixedT)$/;
const skipContext = (node) => {
  const p = node.parent;
  if (!p) return false;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p)) return true;
  if (ts.isPropertyAssignment(p) && p.name === node) return true;
  if (ts.isEnumMember(p) || ts.isPropertySignature(p) || ts.isElementAccessExpression(p) || ts.isCaseClause(p)) return true;
  if (ts.isBinaryExpression(p) && ['===', '!==', '==', '!='].includes(p.operatorToken.getText())) return true;
  if (ts.isCallExpression(p)) {
    const callee = p.expression.getText();
    if (/^console\./.test(callee) || callee === 'require') return true;
    if (/^(t|tk|i18n\.t)$/.test(callee)) return true;
    if (SKIP_CALLS.test(callee) && p.arguments[0] === node) return true;
  }
  if (ts.isNewExpression(p) && /^(Error|URL|RegExp|Date)$/.test(p.expression.getText())) return true;
  if (ts.isJsxAttribute(p) && TEXT_ATTRS.test(p.name.getText())) return true;
  return false;
};

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, rel.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const report = (node, what) => {
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line;
    if (/i18n-ignore/.test(lines[line]) || /i18n-ignore/.test(lines[line - 1] ?? '')) return;
    fail(`${rel}:${line + 1} texto fijo en español: ${what.replace(/\s+/g, ' ').slice(0, 80)}`);
  };
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && (node.expression.text === 't' || node.expression.text === 'tk')) {
      const arg = node.arguments[0];
      if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))) usedKeys.add(arg.text);
    }
    if (ts.isJsxText(node)) {
      const value = node.text.replace(/\s+/g, ' ').trim();
      if (/\p{L}{2,}/u.test(value)) report(node, value);
      return;
    }
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !skipContext(node) && looksSpanish(node.text)) report(node, node.text);
    if (ts.isTemplateExpression(node) && !skipContext(node)) {
      const staticText = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(' ');
      // Rutas y nombres de archivo ("/client-requests/1/photos", "foto1.jpg") no son texto para la persona
      if (/\p{L}{3,}/u.test(staticText) && !/\/|\.jpg/.test(staticText)) report(node, staticText);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

// Claves que se arman al vuelo (por ejemplo `errors.${key}`) no se pueden ver en el código: se cuentan por su prefijo
const DYNAMIC_PREFIXES = ['errors.', 'messages.', 'fields.', 'docs.'];
for (const key of usedKeys) if (!(key in es) && !(`${key}_other` in es)) fail(`la clave "${key}" se usa en el código pero no está en es.json`);
const unused = Object.keys(es).filter((k) => !usedKeys.has(k) && !usedKeys.has(base(k)) && !DYNAMIC_PREFIXES.some((p) => k.startsWith(p)));
if (unused.length) fail(`es.json tiene ${unused.length} claves que nadie usa (p. ej. ${unused.slice(0, 6).join(', ')})`);

if (problems.length) {
  console.error(`\n✖ Control de idiomas: ${problems.length} problemas\n`);
  problems.slice(0, 200).forEach((p) => console.error(' - ' + p));
  if (problems.length > 200) console.error(` ... y ${problems.length - 200} más`);
  process.exit(1);
}
console.log(`✔ Control de idiomas: ${Object.keys(es).length} claves, ${LANGS.length + 1} idiomas completos, sin texto fijo en español.`);
