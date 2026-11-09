import { ProgressSteps } from "./ui";
import { useTranslation } from 'react-i18next';
import { tk } from '../../i18n';

const STEPS = [
    { label: tk('tripProgress.aceptado'), statuses: ['ACCEPTED', 'ON_THE_WAY'] },
    { label: tk('tripProgress.enElOrigen'), statuses: ['ARRIVED'] },
    { label: tk('tripProgress.cargaRecogida'), statuses: ['TRAVELING'] },
    { label: tk('common.entregado'), statuses: ['FINISHED'] },
];

// Barra de progreso del viaje que ven el cliente y el conductor
export default function TripProgress({ status }: { status: string }) {
    const { t } = useTranslation();
    const current = STEPS.findIndex((step) => step.statuses.includes(status));
    return <ProgressSteps steps={STEPS.map((step) => t(step.label))} current={current} />;
}
