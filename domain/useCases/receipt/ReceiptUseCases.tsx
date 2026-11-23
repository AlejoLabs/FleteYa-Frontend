import { ReceiptRepository } from "../../repository/ReceiptRepository";
import { GetReceiptUseCase } from "./GetReceiptUseCase";

export class ReceiptUseCases {
    getReceipt: GetReceiptUseCase;

    constructor({ receiptRepository }: { receiptRepository: ReceiptRepository }){
        this.getReceipt = new GetReceiptUseCase({ receiptRepository });
    }
}
