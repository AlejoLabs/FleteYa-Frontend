import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";
import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { ClientRequest } from "../../../../domain/models/ClientRequest";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverPosition } from "../../../../domain/models/DriverPosition";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";

export class DriverTripOfferService {

    async create(driverTripOffer: DriverTripOffer): Promise<DriverTripOffer | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<DriverTripOffer>(`/driver-trip-offers`, driverTripOffer);
            console.log('Response', response.data);
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

    /*async getDriverPosition(idDriver: number): Promise<DriverPosition | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<DriverPosition>(`/drivers-position/${idDriver}`);
            console.log('Response', response.data);

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
    }*/

}
