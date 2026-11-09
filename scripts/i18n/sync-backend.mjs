// Copia a la app los textos que comparten el backend y la app (Fase 9a): errors, messages, fields y docs.
// El backend es la fuente: sus códigos de error (errors.TRIP_NOT_FOUND...) llegan en las respuestas y la app los traduce
// con estos mismos textos. Uso (desde la raíz de FleteYa-Frontend):  node scripts/i18n/sync-backend.mjs [carpeta del backend]
import fs from 'node:fs';
import path from 'node:path';

const backend = path.resolve(process.argv[2] ?? '../FleteYa-Backend');
const SHARED = ['errors', 'messages', 'fields', 'docs'];
const LANGS = ['es', 'en', 'fr', 'it', 'pt', 'de'];

for (const lang of LANGS) {
  const from = path.join(backend, 'src/i18n/locales', `${lang}.json`);
  const to = path.join('i18n/locales', `${lang}.json`);
  const source = JSON.parse(fs.readFileSync(from, 'utf8'));
  const target = JSON.parse(fs.readFileSync(to, 'utf8'));
  for (const section of SHARED) {
    if (source[section]) target[section] = source[section];
  }
  fs.writeFileSync(to, JSON.stringify(target, null, 2) + '\n');
  console.log(`${lang}: ${SHARED.filter((s) => source[s]).join(', ') || '(el backend todavía no tiene este idioma)'}`);
}
