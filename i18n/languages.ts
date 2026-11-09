// Los idiomas de la app. El español es la base y el respaldo: lo que falte en otro idioma se muestra en español
export const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'it', 'pt', 'de'] as const;
export type LanguageCode = typeof SUPPORTED_LANGUAGES[number];

export const DEFAULT_LANGUAGE: LanguageCode = 'es';

// nativeName: cada idioma se escribe en el idioma mismo, para que se reconozca aunque la app esté en otro
// locale: la etiqueta que usan las fechas y los números (el español sigue en es-CO, como antes)
export const LANGUAGES: { code: LanguageCode; nativeName: string; locale: string }[] = [
    { code: 'es', nativeName: 'Español',   locale: 'es-CO' },
    { code: 'en', nativeName: 'English',   locale: 'en-US' },
    { code: 'fr', nativeName: 'Français',  locale: 'fr-FR' },
    { code: 'it', nativeName: 'Italiano',  locale: 'it-IT' },
    { code: 'pt', nativeName: 'Português', locale: 'pt-BR' },
    { code: 'de', nativeName: 'Deutsch',   locale: 'de-DE' },
];

export const isSupportedLanguage = (value: unknown): value is LanguageCode =>
    typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

// Del código del teléfono ("pt-BR", "en_US", "fr") al idioma de la app; null si no la tenemos en ese idioma
export const toSupportedLanguage = (tag?: string | null): LanguageCode | null => {
    const base = tag?.toLowerCase().split(/[-_]/)[0];
    return isSupportedLanguage(base) ? base : null;
}
