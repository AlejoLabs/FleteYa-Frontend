import { PaymentRepository } from "../../repository/PaymentRepository";

export class SetTipUseCase {
    private paymentRepository: PaymentRepository;

    constructor({paymentRepository}: {paymentRepository: PaymentRepository}){
        this.paymentRepository = paymentRepository;
    }

    async execute(idClientRequest: number, tip: number) {
        return await this.paymentRepository.setTip(idClientRequest, tip);
    }
}
