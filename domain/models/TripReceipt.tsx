// Comprobante de un flete pagado (GET /client-requests/:id/receipt). Las cifras son las que se fijaron al pagar
export type ReceiptLineType = 'TRANSPORT' | 'TIP' | 'COMMISSION' | 'TAX';

export interface TripReceiptLine {
    type: ReceiptLineType;
    amount: number;
    // true = ya está dentro del valor del flete: se informa, no se suma al total
    included: boolean;
    // Comisión o impuesto: su tasa como fracción (0.1 = 10 %)
    rate?: number | null;
    // Solo el impuesto: cómo se llama en el país (IVA, MwSt....)
    name?: string;
}

export interface TripReceipt {
    receipt_number: string;
    // Clave del tipo de comprobante (FACTURA_ELECTRONICA, NFSE, RECEIPT, FACTURE, RECHNUNG, GENERIC)
    receipt_type: string;
    // Cómo se llama el identificador fiscal en el país (NIT, EIN...)
    tax_id_label: string;
    id_client_request: number;
    country_code: string;
    currency: string;
    // Fecha del pago en UTC (ISO): se muestra con la hora del teléfono
    issued_at: string;
    payment_method: 'CASH' | 'WOMPI';
    pickup_description: string;
    destination_description: string;
    client: string | null;
    driver: string | null;
    lines: TripReceiptLine[];
    // Valor acordado + propina
    total: number;
}
