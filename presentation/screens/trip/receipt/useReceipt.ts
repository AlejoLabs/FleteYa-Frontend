import { useEffect, useState } from "react";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { TripReceipt } from "../../../../domain/models/TripReceipt";
import { ReceiptViewModel } from "./ReceiptViewModel";

// Carga el comprobante (y, si se abrió justo después de pagar, el flete para poder calificar)
export function useReceipt(viewModel: ReceiptViewModel, idClientRequest: number, afterPayment: boolean) {
    const [receipt, setReceipt] = useState<TripReceipt | null>(null);
    const [request, setRequest] = useState<ClientRequestResponse | null>(null);
    const [failed, setFailed] = useState(false);

    const load = async () => {
        setFailed(false);
        const [receiptResponse, requestResponse] = await Promise.all([
            viewModel.getReceipt(idClientRequest),
            afterPayment ? viewModel.getClientRequest(idClientRequest) : Promise.resolve(null),
        ]);
        if (!('receipt_number' in receiptResponse)) {
            setFailed(true);
            return;
        }
        setReceipt(receiptResponse);
        if (requestResponse && 'id' in requestResponse) setRequest(requestResponse);
    }

    useEffect(() => {
        load();
    }, [idClientRequest]);

    return { receipt, request, failed, reload: load };
}
