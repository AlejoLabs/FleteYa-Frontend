import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { Country, CountryAtPoint, ExchangeRates } from "../../../../domain/models/Country";

// Países de FleteYa. La lista no pide sesión (la usa el registro); el país de un punto sí
export class CountryService {

    private toErrorResponse(error: any): ErrorResponse {
        if (error.response) {
            console.log('Error del servidor', error.response.data?.message);
            return error.response.data;
        }
        console.log('Error en la peticion', error.message);
        return defaultErrorResponse;
    }

    async getCountries(): Promise<Country[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<Country[]>('/countries');
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    // Pide sesión: se consulta después de entrar
    async getExchangeRates(): Promise<ExchangeRates | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<ExchangeRates>('/exchange-rates');
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async getCountryAt(lat: number, lng: number): Promise<CountryAtPoint | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<CountryAtPoint>(`/countries/at/${lat}/${lng}`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }
}
