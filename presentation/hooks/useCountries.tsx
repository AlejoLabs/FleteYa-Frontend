import { useEffect, useSyncExternalStore } from "react";
import { CountryUseCases } from "../../domain/useCases/country/CountryUseCases";
import { knownCountries, setKnownCountries, subscribeCountries, supportedCountriesText } from "../utils/Countries";
import { setLocalErrorParams } from "../../i18n/apiMessages";

const RETRY_MS = 30 * 1000;

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
}

// La lista de países, que vuelve a pintar la pantalla cuando llega
export const useKnownCountries = () => useSyncExternalStore(subscribeCountries, knownCountries);
