import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { LocalStorage } from '../data/sources/local/LocalStorage';
import { DEFAULT_LANGUAGE, LANGUAGES, LanguageCode, toSupportedLanguage } from './languages';
import es from './locales/es.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import de from './locales/de.json';

const LANGUAGE_KEY = 'language';

// El primer idioma del teléfono que la app tenga; si ninguno, español
const deviceLanguage = (): LanguageCode => {
    for (const locale of getLocales()) {
        const language = toSupportedLanguage(locale.languageTag) ?? toSupportedLanguage(locale.languageCode);
        if (language) return language;
    }
    return DEFAULT_LANGUAGE;
}

i18n.use(initReactI18next).init({
    resources: {
        es: { translation: es }, en: { translation: en }, fr: { translation: fr },
        it: { translation: it }, pt: { translation: pt }, de: { translation: de },
    },
    lng: deviceLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false }, // React Native no interpreta HTML
    returnNull: false,
    initAsync: false, // los textos están en el paquete: t() ya funciona desde la primera línea
});

export const t = i18n.t.bind(i18n);

export const currentLanguage = (): LanguageCode => (toSupportedLanguage(i18n.language) ?? DEFAULT_LANGUAGE);

// Etiqueta para fechas y números ("es-CO", "en-US"...) según el idioma que se está usando
export const currentLocale = (): string =>
    LANGUAGES.find((language) => language.code === currentLanguage())?.locale ?? 'es-CO';

// Cambia el idioma de toda la app y lo recuerda en este teléfono (también para antes de iniciar sesión)
export const setLanguage = async (language: LanguageCode) => {
    await i18n.changeLanguage(language);
    await new LocalStorage().save(LANGUAGE_KEY, language);
}

// Al abrir la app: si la persona ya eligió un idioma en este teléfono, se usa ese en vez del del celular
export const loadSavedLanguage = async () => {
    const saved = toSupportedLanguage(await new LocalStorage().getItem(LANGUAGE_KEY));
    if (saved && saved !== currentLanguage()) await i18n.changeLanguage(saved);
}

export default i18n;

// Marca un texto fijo de un archivo (una lista de pasos, por ejemplo) con su clave: no lo traduce todavía.
// Quien lo muestra lo pasa por t(), así cambia de idioma sin recargar la lista
export const tk = <K extends string>(key: K): K => key;

// Pasa un texto a minúscula para meterlo en medio de una frase ("cargue en piso 3"). En alemán los sustantivos
// siempre llevan mayúscula, así que ahí se deja como está
export const lowerInSentence = (text: string): string => (currentLanguage() === 'de' ? text : text.toLowerCase());
