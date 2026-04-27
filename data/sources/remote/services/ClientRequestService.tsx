import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";
import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";

export class ClientRequestService {
    async getTimeAndDistance(origin: LatLng, destination: LatLng): Promise<TimeAndDistanceValues | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<TimeAndDistanceValues>(`/client-requests/${origin.latitude}/${origin.longitude}/${destination.latitude}/${destination.longitude}`);
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
}
