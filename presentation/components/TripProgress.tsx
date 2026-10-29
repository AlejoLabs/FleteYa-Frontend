import { ProgressSteps } from "./ui";

const STEPS = [
    { label: 'Aceptado', statuses: ['ACCEPTED', 'ON_THE_WAY'] },
    { label: 'En el origen', statuses: ['ARRIVED'] },
    { label: 'Carga recogida', statuses: ['TRAVELING'] },
    { label: 'Entregado', statuses: ['FINISHED'] },
];

// Barra de progreso del viaje que ven el cliente y el conductor
export default function TripProgress({ status }: { status: string }) {
    const current = STEPS.findIndex((step) => step.statuses.includes(status));
    return <ProgressSteps steps={STEPS.map((step) => step.label)} current={current} />;
}
