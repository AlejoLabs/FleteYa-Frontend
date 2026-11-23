import { PaymentRepository } from "../../repository/PaymentRepository";
import { GetTripPaymentUseCase } from "./GetTripPaymentUseCase";
import { ChangePaymentMethodUseCase } from "./ChangePaymentMethodUseCase";
import { StartOnlinePaymentUseCase } from "./StartOnlinePaymentUseCase";
import { VerifyOnlinePaymentUseCase } from "./VerifyOnlinePaymentUseCase";
import { ConfirmCashPaymentUseCase } from "./ConfirmCashPaymentUseCase";
import { SetTipUseCase } from "./SetTipUseCase";

export class PaymentUseCases {
    getPayment: GetTripPaymentUseCase;
    changeMethod: ChangePaymentMethodUseCase;
    startOnline: StartOnlinePaymentUseCase;
    verifyOnline: VerifyOnlinePaymentUseCase;
    confirmCash: ConfirmCashPaymentUseCase;
    setTip: SetTipUseCase;

    constructor({ paymentRepository }: { paymentRepository: PaymentRepository }){
        this.getPayment = new GetTripPaymentUseCase({ paymentRepository });
        this.changeMethod = new ChangePaymentMethodUseCase({ paymentRepository });
        this.startOnline = new StartOnlinePaymentUseCase({ paymentRepository });
        this.verifyOnline = new VerifyOnlinePaymentUseCase({ paymentRepository });
        this.confirmCash = new ConfirmCashPaymentUseCase({ paymentRepository });
        this.setTip = new SetTipUseCase({ paymentRepository });
    }
}
