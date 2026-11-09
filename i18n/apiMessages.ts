import i18n, { t } from './index';

type Params = Record<string, unknown>;

// Un dato que empieza con "@" es la clave de otro texto (por ejemplo el nombre de un campo): también se traduce
const resolveParams = (params?: Params): Params | undefined => {
    if (!params) return undefined;
    return Object.fromEntries(Object.entries(params).map(([name, value]) =>
        [name, typeof value === 'string' && value.startsWith('@') ? t(value.slice(1)) : value]));
}

const translateKey = (section: 'errors' | 'messages', key: string, params?: Params): string | null => {
    const path = `${section}.${key}`;
    // Con count el texto puede estar en sus formas de plural (clave_one, clave_other)
    return i18n.exists(path) || i18n.exists(`${path}_other`) ? t(path, resolveParams(params) ?? {}) : null;
}

// El backend manda el mensaje en español junto con un código (key, params o keys). Aquí se cambia por el
// mismo mensaje en el idioma de la app; si el código no se conoce, queda el mensaje que llegó
export const translateApiMessage = (data: any, section: 'errors' | 'messages') => {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray(data.keys)) {
        const original: string[] = Array.isArray(data.message) ? data.message : [data.message];
        const translated = data.keys.map((item: { key: string; params?: Params } | null, index: number) =>
            (item && translateKey(section, item.key, item.params)) ?? original[index]);
        data.message = translated.length === 1 ? translated[0] : translated;
    } else if (typeof data.key === 'string') {
        data.message = translateKey(section, data.key, data.params) ?? data.message;
    }
    return data;
}
