import { Country, CountryAtPoint, ExchangeRates } from "../../domain/models/Country";
import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { CountryRepository } from "../../domain/repository/CountryRepository";
import { CountryService } from "../sources/remote/services/CountryService";

export class CountryRepositoryImpl implements CountryRepository {

    private countryService: CountryService;
    // La lista casi nunca cambia: se pide una vez por sesión de la app
    private countries: Country[] | null = null;

    constructor({ countryService }: { countryService: CountryService }) {
        this.countryService = countryService;
    }

    async getCountries(): Promise<Country[] | ErrorResponse> {
        if (this.countries) return this.countries;
        const result = await this.countryService.getCountries();
        if (Array.isArray(result)) this.countries = result;
        return result;
    }

    async getCountryAt(lat: number, lng: number): Promise<CountryAtPoint | ErrorResponse> {
        return await this.countryService.getCountryAt(lat, lng);
    }

    async getExchangeRates(): Promise<ExchangeRates | ErrorResponse> {
        return await this.countryService.getExchangeRates();
    }
}
