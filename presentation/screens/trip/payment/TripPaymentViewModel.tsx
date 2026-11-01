import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { PaymentUseCases } from "../../../../domain/useCases/payment/PaymentUseCases";
import { PaymentMethod } from "../../../../domain/models/ClientRequest";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { TripPayment } from "../../../../domain/models/TripPayment";
import { ReceiptLine } from "../../../components/ui";
import { formatCOP } from "../../../utils/Formatters";

export type PaymentRole = 'CLIENT' | 'DRIVER';

// Lo que eligió el cliente en el checkout, como lo devuelve Wompi
const ONLINE_METHODS: Record<string, string> = {
    NEQUI: 'Nequi',
    CARD: 'tarjeta',
    PSE: 'PSE',
    BANCOLOMBIA_TRANSFER: 'Bancolombia',
};

export interface Receipt {
    title: string;
    lines: ReceiptLine[];
    totalLabel: string;
    total: number;
    footnote?: string;
}

// Pago del flete al entregar la carga. La misma pantalla la usan el cliente (paga) y el conductor (cobra)
export class TripPaymentViewModel {

    private clientRequestUseCases: ClientRequestUseCases;
    private paymentUseCases: PaymentUseCases;
    private socketService: SocketService;

    constructor(
        {
            clientRequestUseCases,
            paymentUseCases,
            socketService
        }:
        {
            clientRequestUseCases: ClientRequestUseCases,
            paymentUseCases: PaymentUseCases,
            socketService: SocketService
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.paymentUseCases = paymentUseCases;
        this.socketService = socketService;
    }

    async getClientRequest(idClientRequest: number) {
        return await this.clientRequestUseCases.getClientRequestById.execute(idClientRequest);
    }

    async getPayment(idClientRequest: number) {
        return await this.paymentUseCases.getPayment.execute(idClientRequest);
    }

    async changeMethod(idClientRequest: number, method: PaymentMethod) {
        return await this.paymentUseCases.changeMethod.execute(idClientRequest, method);
    }

    async startOnline(idClientRequest: number) {
        return await this.paymentUseCases.startOnline.execute(idClientRequest);
    }

    async verifyOnline(idClientRequest: number) {
        return await this.paymentUseCases.verifyOnline.execute(idClientRequest);
    }

    async confirmCash(idClientRequest: number) {
        return await this.paymentUseCases.confirmCash.execute(idClientRequest);
    }

    initSocket() {
        this.socketService.connect();
    }

    // Se pagó o el cliente cambió de método: el otro lo ve sin recargar
    listenerPaymentChanges(idClientRequest: number, callback: () => void) {
        const offPaid = this.socketService.onMessage(`trip_paid/${idClientRequest}`, callback);
        const offMethod = this.socketService.onMessage(`payment_method/${idClientRequest}`, callback);
        return () => { offPaid(); offMethod(); };
    }

    roleOf(request: ClientRequestResponse, userId?: number): PaymentRole {
        return request.id_client === userId ? 'CLIENT' : 'DRIVER';
    }

    commissionPercent(request: ClientRequestResponse) {
        return Math.round((request.commission_rate ?? 0) * 100);
    }

    // "Pagado con Nequi", "Pagado en efectivo"
    paidText(payment: TripPayment) {
        if (payment.payment_method === 'CASH') return 'Pagado en efectivo';
        const method = payment.last_payment?.wompi_method;
        return method ? `Pagado con ${ONLINE_METHODS[method] ?? method} por la app` : 'Pagado por la app';
    }

    // El cliente ve lo que paga y que la comisión ya va incluida; el conductor, lo que le queda después de la comisión
    receipt(request: ClientRequestResponse, payment: TripPayment, role: PaymentRole): Receipt {
        const percent = this.commissionPercent(request);
        const commissionLabel = `comisión FleteYa${percent ? ` (${percent} %)` : ''}`;
        const footnote = payment.paid_at ? this.paidText(payment) : undefined;
        if (role === 'CLIENT') {
            return {
                title: 'Resumen del pago',
                lines: [
                    { label: 'Transporte de la carga', value: payment.amount },
                    ...(payment.commission > 0 ? [{ label: `Incluye ${commissionLabel}`, value: payment.commission, kind: 'fee' as const }] : []),
                ],
                totalLabel: payment.paid_at ? 'Total pagado' : 'Total a pagar',
                total: payment.amount,
                footnote,
            };
        }
        return {
            title: 'Tu ganancia',
            lines: [
                { label: 'Valor del flete', value: payment.amount },
                { label: `Menos ${commissionLabel}`, value: payment.commission, kind: 'fee' },
            ],
            totalLabel: 'Te queda',
            total: payment.amount - payment.commission,
            footnote,
        };
    }

    // Texto de espera mientras el flete no está pagado
    pendingText(payment: TripPayment, role: PaymentRole) {
        const amount = formatCOP(payment.amount);
        if (role === 'CLIENT') {
            return payment.payment_method === 'CASH'
                ? `Entrégale ${amount} en efectivo al conductor. Él confirma el pago desde su app.`
                : `Paga ${amount} con Nequi, tarjeta o PSE. Se abre la página de pago y luego vuelves aquí.`;
        }
        return payment.payment_method === 'CASH'
            ? `Cobra ${amount} en efectivo y confirma cuando lo recibas.`
            : 'El cliente va a pagar por la app. Te avisamos cuando el pago se apruebe.';
    }

    wasDeclined(payment: TripPayment) {
        const status = payment.last_payment?.status;
        return !payment.paid_at && payment.payment_method === 'WOMPI' && (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED');
    }
}
