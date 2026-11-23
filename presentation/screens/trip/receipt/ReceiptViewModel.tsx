import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { ReceiptUseCases } from "../../../../domain/useCases/receipt/ReceiptUseCases";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { TripReceipt, TripReceiptLine } from "../../../../domain/models/TripReceipt";
import { ReceiptLine } from "../../../components/ui";
import { formatNumber } from "../../../utils/Formatters";
import { t, tk } from '../../../../i18n';

// Tipos de comprobante que la app sabe nombrar; uno que el backend agregue y la app no conozca se muestra como genérico
const TYPE_NAMES: Record<string, string> = {
    FACTURA_ELECTRONICA: tk('receipt.types.FACTURA_ELECTRONICA'),
    NFSE: tk('receipt.types.NFSE'),
    RECEIPT: tk('receipt.types.RECEIPT'),
    FACTURE: tk('receipt.types.FACTURE'),
    RECHNUNG: tk('receipt.types.RECHNUNG'),
    GENERIC: tk('receipt.types.GENERIC'),
};

// Comprobante de un flete pagado: las cifras vienen del backend tal como se fijaron al pagar
export class ReceiptViewModel {

    private receiptUseCases: ReceiptUseCases;
    private clientRequestUseCases: ClientRequestUseCases;

    constructor({ receiptUseCases, clientRequestUseCases }: { receiptUseCases: ReceiptUseCases, clientRequestUseCases: ClientRequestUseCases }) {
        this.receiptUseCases = receiptUseCases;
        this.clientRequestUseCases = clientRequestUseCases;
    }

    async getReceipt(idClientRequest: number) {
        return await this.receiptUseCases.getReceipt.execute(idClientRequest);
    }

    // Para pasar a calificar desde el comprobante
    async getClientRequest(idClientRequest: number) {
        return await this.clientRequestUseCases.getClientRequestById.execute(idClientRequest);
    }

    // "Factura electrónica", "NFS-e", "Receipt"... según la clave que mandó el backend
    typeName(receipt: TripReceipt) {
        return t(TYPE_NAMES[receipt.receipt_type] ?? TYPE_NAMES.GENERIC);
    }

    private percent(rate?: number | null) {
        return formatNumber((rate ?? 0) * 100, 3);
    }

    private lineLabel(line: TripReceiptLine) {
        switch (line.type) {
            case 'TRANSPORT': return t('receipt.transporteDeLaCarga');
            case 'TIP': return t('receipt.propina');
            case 'COMMISSION': return t('receipt.comisionFleteYaIncluida', { percent: this.percent(line.rate) });
            case 'TAX': return t('receipt.impuestoSobreLaComision', { name: line.name ?? '', percent: this.percent(line.rate) });
        }
    }

    // Las líneas del comprobante. La comisión y el impuesto ya están dentro del valor del flete: se informan, no se suman.
    // Sin propina no se escribe la línea
    lines(receipt: TripReceipt): ReceiptLine[] {
        return receipt.lines
            .filter((line) => line.type !== 'TIP' || line.amount > 0)
            .map((line) => ({ label: this.lineLabel(line), value: line.amount, kind: line.included ? 'fee' as const : 'charge' as const }));
    }

    paymentText(receipt: TripReceipt) {
        return receipt.payment_method === 'CASH' ? t('receipt.pagadoEnEfectivo') : t('receipt.pagadoPorLaApp');
    }

    // A quién califica quien abrió el comprobante justo después de pagar
    isClient(request: ClientRequestResponse, userId?: number) {
        return request.id_client === userId;
    }
}
