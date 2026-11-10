import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { PaymentUseCases } from "../../../../domain/useCases/payment/PaymentUseCases";
import { PaymentMethod } from "../../../../domain/models/ClientRequest";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { TripPayment } from "../../../../domain/models/TripPayment";
import { ReceiptLine } from "../../../components/ui";
import { formatMoney } from "../../../utils/Formatters";
import { t } from '../../../../i18n';

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
    // Moneda del viaje: todas las líneas van en ella
    currency?: string;
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
        if (payment.payment_method === 'CASH') return t('tripPayment.pagadoEnEfectivo');
        const method = payment.last_payment?.wompi_method;
        return method ? t('tripPayment.pagadoConPorLaApp', { value: ONLINE_METHODS[method] ?? method }) : t('tripPayment.pagadoPorLaApp');
    }

    // El cliente ve lo que paga y que la comisión ya va incluida; el conductor, lo que le queda después de la comisión
    receipt(request: ClientRequestResponse, payment: TripPayment, role: PaymentRole): Receipt {
        const percent = this.commissionPercent(request);
        const commissionLabel = percent ? t('tripPayment.comisionFleteYaPorcentaje', { percent }) : t('tripPayment.comisionFleteYa');
        const footnote = payment.paid_at ? this.paidText(payment) : undefined;
        if (role === 'CLIENT') {
            return {
                title: t('tripPayment.resumenDelPago'),
                lines: [
                    { label: t('tripPayment.transporteDeLaCarga'), value: payment.amount },
                    ...(payment.commission > 0 ? [{ label: t('tripPayment.incluye', { commissionLabel }), value: payment.commission, kind: 'fee' as const }] : []),
                ],
                totalLabel: payment.paid_at ? t('tripPayment.totalPagado') : t('tripPayment.totalAPagar'),
                total: payment.amount,
                currency: payment.currency,
                footnote,
            };
        }
        return {
            title: t('tripPayment.tuGanancia'),
            lines: [
                { label: t('tripPayment.valorDelFlete'), value: payment.amount },
                { label: t('tripPayment.menos', { commissionLabel }), value: payment.commission, kind: 'fee' },
            ],
            totalLabel: t('tripPayment.teQueda'),
            total: payment.amount - payment.commission,
            currency: payment.currency,
            footnote,
        };
    }

    // Texto de espera mientras el flete no está pagado
    pendingText(payment: TripPayment, role: PaymentRole) {
        const amount = formatMoney(payment.amount, payment.currency);
        if (role === 'CLIENT') {
            if (payment.payment_method === 'CASH') return t('tripPayment.entregaleEnEfectivoAlConductor', { amount });
            // Nequi y PSE son de Colombia: en otra moneda solo se nombra el pago por la app
            return !payment.currency || payment.currency === 'COP'
                ? t('tripPayment.pagaConNequiTarjetaO', { amount })
                : t('tripPayment.pagaPorLaApp', { amount });
        }
        return payment.payment_method === 'CASH'
            ? t('tripPayment.cobraEnEfectivoYConfirma', { amount })
            : t('tripPayment.elClienteVaAPagar');
    }

    wasDeclined(payment: TripPayment) {
        const status = payment.last_payment?.status;
        return !payment.paid_at && payment.payment_method === 'WOMPI' && (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED');
    }
}
