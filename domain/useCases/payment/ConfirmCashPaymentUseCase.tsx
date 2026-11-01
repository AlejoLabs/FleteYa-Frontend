import { PaymentRepository } from "../../repository/PaymentRepository";

export class ConfirmCashPaymentUseCase {
    private paymentRepository: PaymentRepository;

    constructor({paymentRepository}: {paymentRepository: PaymentRepository}){
        this.paymentRepository = paymentRepository;
    }

    async execute(idClientRequest: number) {
        return await this.paymentRepository.confirmCash(idClientRequest);
    }
}
