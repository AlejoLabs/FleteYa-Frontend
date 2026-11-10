import { useEffect, useState } from "react";
import { ConfirmDialog, PriceStepper } from "../../../components/ui";
import { formatMoney } from "../../../utils/Formatters";
import { currencyRules } from "../../../utils/Countries";
import { useTranslation } from 'react-i18next';

interface Props {
    visible: boolean;
    clientFare: number;
    // Moneda del flete (la del país donde se recoge)
    currency?: string;
    // Si ya ofertó, se arranca desde su oferta; si no, un paso por encima de lo que ofrece el cliente (en pesos, mil)
    myOffer: number | null;
    sending: boolean;
    onSend: (fare: number) => void;
    onClose: () => void;
}

// El conductor propone su precio con − y +; el cliente lo ve como una oferta más
export default function CounterOfferDialog({ visible, clientFare, currency, myOffer, sending, onSend, onClose }: Props) {
    const { t } = useTranslation();
    const rules = currencyRules(currency);
    const [fare, setFare] = useState(myOffer ?? clientFare + rules.fare_step);

    useEffect(() => {
        if (visible) setFare(myOffer ?? clientFare + rules.fare_step);
    }, [visible]);

    return (
        <ConfirmDialog
            visible={visible}
            title={t('counterOfferDialog.tuPrecioParaEsteFlete')}
            message={t('counterOfferDialog.elClienteOfrece', { amount: formatMoney(clientFare, currency) })}
            confirmLabel={t('counterOfferDialog.ofertar', { amount: formatMoney(fare, currency) })}
            loading={sending}
            onConfirm={() => onSend(fare)}
            onCancel={onClose}
        >
            <PriceStepper value={fare} currency={currency} min={rules.min_fare} max={rules.max_fare} onChange={setFare} />
        </ConfirmDialog>
    );
}
