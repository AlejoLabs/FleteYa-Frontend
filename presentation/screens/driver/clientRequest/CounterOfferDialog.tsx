import { useEffect, useState } from "react";
import { ConfirmDialog, PriceStepper } from "../../../components/ui";
import { formatCOP } from "../../../utils/Formatters";

const FARE_STEP = 1000;
const MIN_FARE = 5000;

interface Props {
    visible: boolean;
    clientFare: number;
    // Si ya ofertó, se arranca desde su oferta; si no, mil pesos por encima de lo que ofrece el cliente
    myOffer: number | null;
    sending: boolean;
    onSend: (fare: number) => void;
    onClose: () => void;
}

// El conductor propone su precio con − y +; el cliente lo ve como una oferta más
export default function CounterOfferDialog({ visible, clientFare, myOffer, sending, onSend, onClose }: Props) {
    const [fare, setFare] = useState(myOffer ?? clientFare + FARE_STEP);

    useEffect(() => {
        if (visible) setFare(myOffer ?? clientFare + FARE_STEP);
    }, [visible]);

    return (
        <ConfirmDialog
            visible={visible}
            title="Tu precio para este flete"
            message={`El cliente ofrece ${formatCOP(clientFare)}.`}
            confirmLabel={`Ofertar ${formatCOP(fare)}`}
            loading={sending}
            onConfirm={() => onSend(fare)}
            onCancel={onClose}
        >
            <PriceStepper value={fare} step={FARE_STEP} min={MIN_FARE} onChange={setFare} />
        </ConfirmDialog>
    );
}
