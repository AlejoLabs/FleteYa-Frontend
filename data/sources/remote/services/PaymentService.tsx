import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { PaymentMethod } from "../../../../domain/models/ClientRequest";
import { OnlinePaymentStart, TripPayment } from "../../../../domain/models/TripPayment";

// Pago del flete al terminar el viaje: efectivo (lo confirma el conductor) o por la app (Wompi o el simulador)
export class PaymentService {

    private toErrorResponse(error: any): ErrorResponse {
        if (error.response) {
            console.log('Error del servidor', error.response.data?.message);
            return error.response.data;
        }
        console.log('Error en la peticion', error.message);
        return defaultErrorResponse;
    }

    async getPayment(idClientRequest: number): Promise<TripPayment | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<TripPayment>(`/client-requests/${idClientRequest}/payment`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async changeMethod(idClientRequest: number, method: PaymentMethod): Promise<TripPayment | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.put<TripPayment>(`/client-requests/${idClientRequest}/payment/method`, { payment_method: method });
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async startOnline(idClientRequest: number): Promise<OnlinePaymentStart | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<OnlinePaymentStart>(`/client-requests/${idClientRequest}/payment/online`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async verifyOnline(idClientRequest: number): Promise<TripPayment | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<TripPayment>(`/client-requests/${idClientRequest}/payment/online/verify`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async confirmCash(idClientRequest: number): Promise<TripPayment | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<TripPayment>(`/client-requests/${idClientRequest}/payment/cash`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }
}
