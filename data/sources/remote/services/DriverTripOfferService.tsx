import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";
import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { ClientRequest } from "../../../../domain/models/ClientRequest";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverPosition } from "../../../../domain/models/DriverPosition";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";

export class DriverTripOfferService {

    // El cliente rechaza una oferta, o el conductor retira la suya
    async changeStatus(idOffer: number, action: 'reject' | 'withdraw'): Promise<boolean | ErrorResponse> {
        try {
            await ApiRequestHandler.put(`/driver-trip-offers/${idOffer}/${action}`, {});
            return true;
        } catch (error: any) {
            if (error.response) {
                console.log('Error del servidor', error.response.data?.message);
                return error.response.data;
            }
            console.log('Error en la peticion', error.message);
            return defaultErrorResponse;
        }
    }

    async create(driverTripOffer: DriverTripOffer): Promise<DriverTripOffer | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<DriverTripOffer>(`/driver-trip-offers`, driverTripOffer);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.error('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.error('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.error('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

    async getDriverTripOffers(idClientRequest: number): Promise<DriverTripOffer[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<DriverTripOffer[]>(`/driver-trip-offers/findByClientRequest/${idClientRequest}`);

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.error('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.error('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.error('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

}
