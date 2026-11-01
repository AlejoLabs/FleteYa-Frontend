import { PaymentRepository } from "../../repository/PaymentRepository";

export class StartOnlinePaymentUseCase {
    private paymentRepository: PaymentRepository;

    constructor({paymentRepository}: {paymentRepository: PaymentRepository}){
        this.paymentRepository = paymentRepository;
    }

    async execute(idClientRequest: number) {
        return await this.paymentRepository.startOnline(idClientRequest);
    }
}
