import { ActiveTrip } from "../../../domain/models/ClientRequestResponse";
import { ClientRequestUseCases } from "../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { StatusTone } from "../../components/ui";
import { formatScheduledDate } from "../../utils/Formatters";
import { t, tk } from '../../../i18n';

export type UpcomingTab = 'ACTIVE' | 'SCHEDULED';

// Todavía no empieza: el cliente lo programó para otro momento y nadie ha salido a recogerlo
const WAITING = ['CREATED', 'ACCEPTED'];

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
    CREATED: { label: tk('upcomingTrips.buscandoConductor'), tone: 'warning' },
    ACCEPTED: { label: tk('upcomingTrips.conductorAsignado'), tone: 'success' },
    ON_THE_WAY: { label: tk('upcomingTrips.conductorEnCamino'), tone: 'success' },
    ARRIVED: { label: tk('upcomingTrips.enLaRecogida'), tone: 'success' },
    TRAVELING: { label: tk('upcomingTrips.cargaEnCamino'), tone: 'cargo' },
    // Entregado y sin pagar: sigue aquí hasta que se pague
    FINISHED: { label: tk('upcomingTrips.pendienteDePago'), tone: 'warning' },
};

// Búsquedas y viajes en curso o programados del usuario, como cliente o como conductor
export class UpcomingTripsViewModel {

    private clientRequestUseCases: ClientRequestUseCases;

    constructor({ clientRequestUseCases }: { clientRequestUseCases: ClientRequestUseCases }) {
        this.clientRequestUseCases = clientRequestUseCases;
    }

    async getMyActiveTrips() {
        return await this.clientRequestUseCases.getMyActiveTrips.execute();
    }

    isScheduled(trip: ActiveTrip, now = Date.now()) {
        return trip.scheduled_at !== null && new Date(trip.scheduled_at).getTime() > now && WAITING.includes(trip.status);
    }

    // En curso primero los que ya arrancaron; programados por fecha, el más cercano arriba
    split(trips: ActiveTrip[]) {
        const scheduled = trips.filter((trip) => this.isScheduled(trip))
            .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());
        const active = trips.filter((trip) => !this.isScheduled(trip));
        return { active, scheduled };
    }

    // Arriba de cada tarjeta: para cuándo es, o "Entregado" si solo falta el pago
    whenText(trip: ActiveTrip) {
        if (trip.status === 'FINISHED') return t('common.entregado');
        return trip.scheduled_at ? formatScheduledDate(trip.scheduled_at) : t('upcomingTrips.ahora');
    }

    status(trip: ActiveTrip) {
        const status = STATUS[trip.status];
        return status ? { ...status, label: t(status.label) } : { label: trip.status, tone: 'neutral' as StatusTone };
    }
}
