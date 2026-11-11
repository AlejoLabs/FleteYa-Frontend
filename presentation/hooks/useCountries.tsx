import { useEffect, useSyncExternalStore } from "react";
import { CountryUseCases } from "../../domain/useCases/country/CountryUseCases";
import { countriesVersion, knownCountries, setExchangeRates, setKnownCountries, subscribeCountries, supportedCountriesText } from "../utils/Countries";
import { setLocalErrorParams } from "../../i18n/apiMessages";

const RETRY_MS = 30 * 1000;
// Las tasas de referencia cambian una vez al día: se refrescan cada 30 minutos. Piden sesión: antes de entrar falla
// y se reintenta al minuto
const RATES_EVERY_MS = 30 * 60 * 1000;
const RATES_RETRY_MS = 60 * 1000;

// Pide los países al abrir la app. Sin internet reintenta cada 30 segundos: mientras tanto los pesos usan sus reglas
export function useCountriesLoader(countryUseCases: CountryUseCases) {
    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const load = async () => {
            const result = await countryUseCases.getCountries.execute();
            if (!active) return;
            if (Array.isArray(result)) {
                setKnownCountries(result);
                // "Por ahora operamos en: ..." con los nombres de los países en el idioma de la app
                setLocalErrorParams('COUNTRY_NOT_SUPPORTED', () => ({ countries: supportedCountriesText() }));
            }
            else timer = setTimeout(load, RETRY_MS);
        };
        load();
        return () => {
            active = false;
            if (timer) clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const loadRates = async () => {
            const result = await countryUseCases.getExchangeRates.execute();
            if (!active) return;
            const ok = 'rates' in result;
            if (ok) setExchangeRates(result);
            timer = setTimeout(loadRates, ok ? RATES_EVERY_MS : RATES_RETRY_MS);
        };
        loadRates();
        return () => {
            active = false;
            if (timer) clearTimeout(timer);
        };
    }, []);
}

// Cambia cuando llegan países o tasas nuevas, o cambia el país de la cuenta: para volver a calcular el "≈"
export const useCountriesVersion = () => useSyncExternalStore(subscribeCountries, countriesVersion);

// La lista de países, que vuelve a pintar la pantalla cuando llega
export const useKnownCountries = () => useSyncExternalStore(subscribeCountries, knownCountries);
