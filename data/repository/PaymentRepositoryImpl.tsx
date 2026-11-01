import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { PaymentMethod } from "../../domain/models/ClientRequest";
import { OnlinePaymentStart, TripPayment } from "../../domain/models/TripPayment";
import { PaymentRepository } from "../../domain/repository/PaymentRepository";
import { PaymentService } from "../sources/remote/services/PaymentService";

export class PaymentRepositoryImpl implements PaymentRepository {

    private paymentService: PaymentService;

    constructor({ paymentService }: { paymentService: PaymentService }) {
        this.paymentService = paymentService;
    }

    async getPayment(idClientRequest: number): Promise<TripPayment | ErrorResponse> {
        return await this.paymentService.getPayment(idClientRequest);
    }
    async changeMethod(idClientRequest: number, method: PaymentMethod): Promise<TripPayment | ErrorResponse> {
        return await this.paymentService.changeMethod(idClientRequest, method);
    }
    async startOnline(idClientRequest: number): Promise<OnlinePaymentStart | ErrorResponse> {
        return await this.paymentService.startOnline(idClientRequest);
    }
    async verifyOnline(idClientRequest: number): Promise<TripPayment | ErrorResponse> {
        return await this.paymentService.verifyOnline(idClientRequest);
    }
    async confirmCash(idClientRequest: number): Promise<TripPayment | ErrorResponse> {
        return await this.paymentService.confirmCash(idClientRequest);
    }
}
