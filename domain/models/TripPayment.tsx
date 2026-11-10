import { PaymentMethod } from "./ClientRequest";

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';

// Estado del pago de un flete (GET /client-requests/:id/payment)
export interface TripPayment {
    id_client_request: number;
    payment_method: PaymentMethod;
    // null = sin pagar
    paid_at: string | null;
    // Moneda del viaje: amount y commission van en ella
    currency?: string;
    amount: number;
    // Comisión de FleteYa, incluida en amount
    commission: number;
    // WOMPI, SIMULATOR (demo sin llaves de Wompi) o null: sin pasarela solo se puede pagar en efectivo
    online_gateway: 'WOMPI' | 'SIMULATOR' | null;
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
    amount: number;
    currency?: string;
    checkout_url: string;
}
