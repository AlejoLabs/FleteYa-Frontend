import { Country, CountryAtPoint, ExchangeRates } from "../models/Country";
import { ErrorResponse } from "../models/ErrorResponse";

export interface CountryRepository {

    getCountries(): Promise<Country[] | ErrorResponse>;
    getCountryAt(lat: number, lng: number): Promise<CountryAtPoint | ErrorResponse>;
    getExchangeRates(): Promise<ExchangeRates | ErrorResponse>;
}
