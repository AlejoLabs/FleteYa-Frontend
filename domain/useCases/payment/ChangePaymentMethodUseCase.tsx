import { PaymentRepository } from "../../repository/PaymentRepository";
import { PaymentMethod } from "../../models/ClientRequest";

export class ChangePaymentMethodUseCase {
    private paymentRepository: PaymentRepository;

    constructor({paymentRepository}: {paymentRepository: PaymentRepository}){
        this.paymentRepository = paymentRepository;
    }

    async execute(idClientRequest: number, method: PaymentMethod) {
        return await this.paymentRepository.changeMethod(idClientRequest, method);
    }
}
