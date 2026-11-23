import { ReceiptRepository } from "../../repository/ReceiptRepository";

export class GetReceiptUseCase {
    private receiptRepository: ReceiptRepository;

    constructor({receiptRepository}: {receiptRepository: ReceiptRepository}){
        this.receiptRepository = receiptRepository;
    }

    async execute(idClientRequest: number) {
        return await this.receiptRepository.getReceipt(idClientRequest);
    }
}
