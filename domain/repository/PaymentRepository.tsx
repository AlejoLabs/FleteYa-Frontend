import { ErrorResponse } from "../models/ErrorResponse";
import { PaymentMethod } from "../models/ClientRequest";
import { OnlinePaymentStart, TripPayment } from "../models/TripPayment";

export interface PaymentRepository {

    getPayment(idClientRequest: number): Promise<TripPayment | ErrorResponse>;
    changeMethod(idClientRequest: number, method: PaymentMethod): Promise<TripPayment | ErrorResponse>;
    startOnline(idClientRequest: number): Promise<OnlinePaymentStart | ErrorResponse>;
    verifyOnline(idClientRequest: number): Promise<TripPayment | ErrorResponse>;
    confirmCash(idClientRequest: number): Promise<TripPayment | ErrorResponse>;
}
