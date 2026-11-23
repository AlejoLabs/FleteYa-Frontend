import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { TripReceipt } from "../../../../domain/models/TripReceipt";

// Comprobante de un flete pagado
export class ReceiptService {

    async getReceipt(idClientRequest: number): Promise<TripReceipt | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<TripReceipt>(`/client-requests/${idClientRequest}/receipt`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                console.log('Error del servidor', error.response.data?.message);
                return error.response.data;
            }
            console.log('Error en la peticion', error.message);
            return defaultErrorResponse;
        }
    }
}
