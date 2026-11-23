import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { TripReceipt } from "../../domain/models/TripReceipt";
import { ReceiptRepository } from "../../domain/repository/ReceiptRepository";
import { ReceiptService } from "../sources/remote/services/ReceiptService";

export class ReceiptRepositoryImpl implements ReceiptRepository {

    private receiptService: ReceiptService;

    constructor({ receiptService }: { receiptService: ReceiptService }) {
        this.receiptService = receiptService;
    }

    async getReceipt(idClientRequest: number): Promise<TripReceipt | ErrorResponse> {
        return await this.receiptService.getReceipt(idClientRequest);
    }
}
