import { ErrorResponse } from "../models/ErrorResponse";
import { TripReceipt } from "../models/TripReceipt";

export interface ReceiptRepository {

    getReceipt(idClientRequest: number): Promise<TripReceipt | ErrorResponse>;
}
