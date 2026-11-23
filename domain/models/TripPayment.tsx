import { PaymentMethod } from "./ClientRequest";
import { TipMode } from "./Country";

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'REFUNDED';

// Estado del pago de un flete (GET /client-requests/:id/payment)
export interface TripPayment {
    id_client_request: number;
    payment_method: PaymentMethod;
    // null = sin pagar
    paid_at: string | null;
    // Moneda del viaje: amount y commission van en ella
    currency?: string;
    // Valor acordado del flete (sin propina)
    amount: number;
    // Propina elegida por el cliente (100 % del conductor) y lo que paga en total: amount + tip
    tip: number;
    total: number;
    // Cómo se pide la propina en el país del flete y hasta cuánto se puede dar
    tip_mode: TipMode;
    tip_suggestions: number[];
    max_tip: number;
    // Comisión de FleteYa, incluida en amount
    commission: number;
    // WOMPI, SIMULATOR (demo sin llaves de Wompi) o null: sin pasarela solo se puede pagar en efectivo
    online_gateway: 'WOMPI' | 'SIMULATOR' | null;
    // Se le devolvió dinero al cliente (flete cancelado o cobro de más): cuánto y cuándo; null = sin reembolsos
    refund: { amount: number; refunded_at: string } | null;
    last_payment: {
        reference: string;
        method: PaymentMethod;
        status: PaymentStatus;
        // NEQUI, CARD, PSE... lo que eligió el cliente en el checkout
        wompi_method: string | null;
        amount: number;
        created_at: string;
    } | null;
}

// Intento de pago por la app: la app abre checkout_url en el navegador
export interface OnlinePaymentStart {
    reference: string;
    // Lo que cobra la pasarela: valor acordado + propina
    amount: number;
    tip: number;
    currency?: string;
    checkout_url: string;
}
