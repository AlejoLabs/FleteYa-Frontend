import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { TripMessage } from "../../../../domain/models/TripMessage";

// Chat del viaje. Los mensajes nuevos llegan por el socket (trip_message/<id>); aquí se envían y se carga el historial
export class TripMessageService {

    private toErrorResponse(error: any): ErrorResponse {
        if (error.response) {
            console.log('Error del servidor', error.response.data?.message);
            return error.response.data;
        }
        console.log('Error en la peticion', error.message);
        return defaultErrorResponse;
    }

    async getMessages(idClientRequest: number): Promise<TripMessage[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<TripMessage[]>(`/client-requests/${idClientRequest}/messages`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async sendMessage(idClientRequest: number, text: string): Promise<TripMessage | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<TripMessage>(`/client-requests/${idClientRequest}/messages`, { text });
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async markRead(idClientRequest: number): Promise<boolean | ErrorResponse> {
        try {
            await ApiRequestHandler.put(`/client-requests/${idClientRequest}/messages/read`);
            return true;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }
}
