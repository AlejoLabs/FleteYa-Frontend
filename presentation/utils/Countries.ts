import { Country, CurrencyRules } from '../../domain/models/Country';
import { getLocales } from 'expo-localization';
import { currentLanguage, t } from '../../i18n';

// Países y monedas que manda el backend (GET /countries), guardados al abrir la app para usarlos sin esperar:
// el paso de los botones del precio, los decimales de cada moneda, el indicativo del celular...
// Mientras no han llegado, los pesos colombianos usan sus reglas de siempre

const COP_RULES: CurrencyRules = { code: 'COP', decimals: 0, fare_step: 1000, min_fare: 5000, max_fare: 10000000 };

let countries: Country[] = [];
const listeners = new Set<() => void>();

export const setKnownCountries = (list: Country[]) => {
    countries = list;
    listeners.forEach((listener) => listener());
}

// Para que una pantalla abierta se actualice cuando la lista llega (useKnownCountries)
export const subscribeCountries = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export const knownCountries = (): Country[] => countries;

export const countryByCode = (code?: string | null): Country | undefined =>
    countries.find((country) => country.code === code);

// Nombre del país en el idioma de la app ("Allemagne" en francés)
export const countryName = (country: Pick<Country, 'code' | 'names'>): string =>
    country.names[currentLanguage()] ?? country.names.es ?? country.code;

// Reglas del precio en una moneda. Si la lista no llegó (sin internet al abrir), una moneda desconocida usa
// un paso de 1 y dos decimales: así nunca se ofrece un paso de 1.000 euros
export const currencyRules = (currency?: string | null): CurrencyRules => {
    const code = currency ?? 'COP';
    const country = countries.find((item) => item.currency === code);
    if (country) {
        return { code, decimals: country.decimals, fare_step: country.fare_step, min_fare: country.min_fare, max_fare: country.max_fare };
    }
    return code === 'COP' ? COP_RULES : { code, decimals: 2, fare_step: 1, min_fare: 1, max_fare: Number.MAX_SAFE_INTEGER };
}

// Redondea un monto a los decimales de su moneda (COP sin centavos, EUR con dos)
export const roundMoney = (value: number, currency?: string | null): number => {
    const factor = 10 ** currencyRules(currency).decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

// Al múltiplo del paso más cercano: el precio sugerido se muestra "redondo" (de a $100 en pesos, de a 1 € en euros)
export const roundToStep = (value: number, step: number): number => Math.round(value / step) * step;

// País del teléfono (la región del celular) si FleteYa opera ahí; si no, Colombia. Es el indicativo con el que
// arranca el registro, igual que el idioma de la pantalla de entrada sale del celular
export const deviceCountryCode = (): string => {
    for (const locale of getLocales()) {
        if (locale.regionCode && countries.some((country) => country.code === locale.regionCode)) return locale.regionCode;
    }
    return 'CO';
}

// Bandera del país a partir de su código (CO → 🇨🇴): no hay que guardar imágenes por país
export const countryFlag = (code: string): string =>
    String.fromCodePoint(...code.toUpperCase().split('').map((letter) => 0x1F1E6 + letter.charCodeAt(0) - 65));

// Error del celular de la cuenta según su país; undefined si está bien. Colombia sigue con su regla y su mensaje de
// siempre (10 dígitos); los demás países usan el formato que manda el backend
export const accountPhoneError = (phone: string, countryCode: string | undefined, colombiaMessage: string): string | undefined => {
    const digits = phone.replace(/\D/g, '');
    const country = countryByCode(countryCode);
    if (!country || country.code === 'CO') return /^\d{10}$/.test(digits) ? undefined : colombiaMessage;
    return new RegExp(country.phone_pattern).test(digits) ? undefined : t('common.celularNoValido', { example: country.phone_example });
}

// Lista de los países donde operamos, con los nombres en el idioma de la app ("Colombia, Mexique, ...")
export const supportedCountriesText = (): string =>
    countries.map(countryName).sort((a, b) => a.localeCompare(b, currentLanguage())).join(', ');
