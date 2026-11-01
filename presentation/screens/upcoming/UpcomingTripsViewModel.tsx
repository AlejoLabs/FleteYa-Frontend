import { ActiveTrip } from "../../../domain/models/ClientRequestResponse";
import { ClientRequestUseCases } from "../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { StatusTone } from "../../components/ui";

export type UpcomingTab = 'ACTIVE' | 'SCHEDULED';

// Todavía no empieza: el cliente lo programó para otro momento y nadie ha salido a recogerlo
const WAITING = ['CREATED', 'ACCEPTED'];

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
    CREATED: { label: 'Buscando conductor', tone: 'warning' },
    ACCEPTED: { label: 'Conductor asignado', tone: 'success' },
    ON_THE_WAY: { label: 'Conductor en camino', tone: 'success' },
    ARRIVED: { label: 'En la recogida', tone: 'success' },
    TRAVELING: { label: 'Carga en camino', tone: 'cargo' },
    // Entregado y sin pagar: sigue aquí hasta que se pague
    FINISHED: { label: 'Pendiente de pago', tone: 'warning' },
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

    status(trip: ActiveTrip) {
        return STATUS[trip.status] ?? { label: trip.status, tone: 'neutral' as StatusTone };
    }
}
