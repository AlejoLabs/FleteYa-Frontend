import { PaymentRepository } from "../../repository/PaymentRepository";
import { GetTripPaymentUseCase } from "./GetTripPaymentUseCase";
import { ChangePaymentMethodUseCase } from "./ChangePaymentMethodUseCase";
import { StartOnlinePaymentUseCase } from "./StartOnlinePaymentUseCase";
import { VerifyOnlinePaymentUseCase } from "./VerifyOnlinePaymentUseCase";
import { ConfirmCashPaymentUseCase } from "./ConfirmCashPaymentUseCase";

export class PaymentUseCases {
    getPayment: GetTripPaymentUseCase;
    changeMethod: ChangePaymentMethodUseCase;
    startOnline: StartOnlinePaymentUseCase;
    verifyOnline: VerifyOnlinePaymentUseCase;
    confirmCash: ConfirmCashPaymentUseCase;

    constructor({ paymentRepository }: { paymentRepository: PaymentRepository }){
        this.getPayment = new GetTripPaymentUseCase({ paymentRepository });
        this.changeMethod = new ChangePaymentMethodUseCase({ paymentRepository });
        this.startOnline = new StartOnlinePaymentUseCase({ paymentRepository });
        this.verifyOnline = new VerifyOnlinePaymentUseCase({ paymentRepository });
        this.confirmCash = new ConfirmCashPaymentUseCase({ paymentRepository });
    }
}
