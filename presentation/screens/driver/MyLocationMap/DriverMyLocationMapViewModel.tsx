import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { DriverDocument } from "../../../../domain/models/DriverDocument";
import { DriverPosition } from "../../../../domain/models/DriverPosition";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";
import { DriverPositionUseCases } from "../../../../domain/useCases/driverPosition/DriverPositionUseCases";
import { cargoCategoryLabel, vehicleLabel } from "../../../utils/Cargo";
import { getTripFare, formatNumber } from '../../../utils/Formatters';
import { t } from '../../../../i18n';
import { docNameKey } from "../../../utils/VehicleRules";

export interface DaySummary {
    // Lo ganado en la moneda con más fletes del día (en pesos si no hubo ninguno)
    earned: number;
    currency: string;
    // Lo ganado en otras monedas el mismo día, si viajó por varios países
    others: { currency: string; earned: number }[];
    trips: number;
}

export interface DocumentAlert {
    tone: 'warning' | 'danger';
    title: string;
}

export interface ApprovalNotice {
    tone: 'info' | 'danger';
    title: string;
    message: string;
}

// Inicio del conductor: disponibilidad (GPS y socket), lo ganado hoy, sus documentos y cuántas solicitudes tiene cerca
// Por qué todavía no puede recibir fletes, escrito en el idioma de la app (el servidor manda el código y los datos)
const blockReasonText = (car: DriverCarInfo) =>
    car.block_reason_detail ? t(`errors.${car.block_reason_detail.key}`, car.block_reason_detail.params ?? {}) : car.block_reason ?? '';

export class DriverMyLocationMapViewModel {
    private clientRequestUseCases: ClientRequestUseCases;
    private driverPositionUseCases: DriverPositionUseCases;
    private driverCarInfoUseCases: DriverCarInfoUseCases;
    private socketService: SocketService;

    constructor(
        {
            clientRequestUseCases,
            socketService,
            driverPositionUseCases,
            driverCarInfoUseCases
        }: {
            clientRequestUseCases: ClientRequestUseCases,
            socketService: SocketService,
            driverPositionUseCases: DriverPositionUseCases,
            driverCarInfoUseCases: DriverCarInfoUseCases
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
        this.driverPositionUseCases = driverPositionUseCases;
        this.driverCarInfoUseCases = driverCarInfoUseCases;
    }

    initSocket(){
        this.socketService.connect();
    }

    emitDriverPosition(id: number, lat: number, lng: number){
        this.socketService.sendMessage('change_driver_position', {
            'id': id,
            'lat': lat,
            'lng': lng
        });
    }

    // El conductor deja de estar disponible: se avisa a los clientes sin cerrar el socket, que usan sus otras pantallas
    discconectSocket(){
        this.socketService.sendMessage('driver_offline', {});
    }

    async createDriverPosition(driverPosition: DriverPosition) {
        return await this.driverPositionUseCases.create.execute(driverPosition);
    }

    async getDriverCarInfo(idDriver: number) {
        return await this.driverCarInfoUseCases.getDriverCarInfo.execute(idDriver);
    }

    async getMyDocuments() {
        return await this.driverCarInfoUseCases.getMyDocuments.execute();
    }

    // Fletes que este conductor ya entregó
    async getFinishedTrips(idDriver: number) {
        return await this.clientRequestUseCases.getByDriverAssigned.execute(idDriver);
    }

    // Las solicitudes que el conductor ve en su lista (cerca y que caben en su vehículo); null si falla
    async getNearbyRequests(latitude: number, longitude: number): Promise<ClientRequestResponse[] | null> {
        const response = await this.clientRequestUseCases.getNearbyTripRequestUseCase.execute({ latitude, longitude });
        return Array.isArray(response) ? response : null;
    }

    async countNearbyRequests(latitude: number, longitude: number) {
        return (await this.getNearbyRequests(latitude, longitude))?.length ?? null;
    }

    // El admin aprobó o rechazó al conductor mientras tenía la app abierta
    listenerDriverReviewed(callback: () => void) {
        return this.socketService.onMessage('driver_reviewed', callback);
    }

    // Aviso del inicio cuando todavía no puede recibir fletes: en revisión, rechazado o con un documento vencido
    approvalNotice(car: DriverCarInfo | null): ApprovalNotice | null {
        if (!car?.block_reason) return null;
        if (car.approval_status === 'PENDING') {
            return { tone: 'info', title: t('driverMyLocationMap.tuCuentaEstaEnRevision'), message: t('driverMyLocationMap.estamosRevisandoTuVehiculoY') };
        }
        if (car.approval_status === 'REJECTED') {
            return { tone: 'danger', title: t('driverMyLocationMap.revisaLosDatosDeTu'), message: blockReasonText(car) };
        }
        return { tone: 'danger', title: t('driverMyLocationMap.noPuedesRecibirFletes'), message: blockReasonText(car) };
    }

    // Un cliente publicó una solicitud; el inicio decide si le sirve a este conductor
    listenerNewClientRequest(callback: (idClientRequest: number) => void) {
        return this.socketService.onMessage('created_client_request', (data: any) => callback(Number(data?.id_client_request)));
    }

    // "Mudanza · a 0,3 km · Paga por la app"
    newRequestText(request: ClientRequestResponse) {
        const km = formatNumber(Number(request.distance) / 1000, 1, 1);
        return [
            cargoCategoryLabel(request.cargo_category),
            t('driverMyLocationMap.aKm', { km }),
            request.payment_method === 'WOMPI' ? t('driverMyLocationMap.pagaPorLaApp') : t('driverMyLocationMap.pagaEnEfectivo'),
            request.scheduled_at ? t('driverMyLocationMap.programado') : null,
        ].filter(Boolean).join(' · ');
    }

    // Lo que le queda al conductor de los fletes entregados hoy (valor acordado menos la comisión de FleteYa),
    // con la fecha del teléfono
    // homeCurrency: la del país del conductor, para mostrar "0" en su moneda cuando todavía no tiene fletes hoy
    daySummary(trips: ClientRequestResponse[], homeCurrency = 'COP', now = new Date()): DaySummary {
        const today = trips.filter((trip) => new Date(trip.update_at).toDateString() === now.toDateString());
        const totals = new Map<string, { earned: number; trips: number }>();
        for (const trip of today) {
            const currency = trip.currency ?? 'COP';
            const total = totals.get(currency) ?? { earned: 0, trips: 0 };
            totals.set(currency, { earned: total.earned + getTripFare(trip) - (trip.commission ?? 0), trips: total.trips + 1 });
        }
        const [main, ...others] = [...totals.entries()].sort((a, b) => b[1].trips - a[1].trips);
        return {
            earned: main?.[1].earned ?? 0,
            currency: main?.[0] ?? homeCurrency,
            others: others.map(([currency, total]) => ({ currency, earned: total.earned })),
            trips: today.length,
        };
    }

    // Promedio de las estrellas que le dieron los clientes, igual que lo calcula el servidor para las ofertas
    rating(trips: ClientRequestResponse[]) {
        const stars = trips.map((trip) => trip.driver_rating).filter((value): value is number => typeof value === 'number');
        if (!stars.length) return { average: null, count: 0 };
        return { average: Math.round(stars.reduce((sum, value) => sum + value, 0) / stars.length * 10) / 10, count: stars.length };
    }

    // "Furgón · VES129"
    vehicleText(carInfo: DriverCarInfo | null) {
        if (!carInfo) return t('driverMyLocationMap.registraTuVehiculo');
        return `${vehicleLabel(carInfo.vehicle_type)} · ${carInfo.plate}`;
    }

    // El documento que más urge: primero uno vencido, si no el que vence antes
    documentAlert(documents: DriverDocument[], countryCode?: string | null): DocumentAlert | null {
        const pending = documents.filter((doc) => doc.status !== 'OK').sort((a, b) => a.days_left - b.days_left);
        const doc = pending[0];
        if (!doc) return null;
        // "Se venció" y no "vencido/vencida": sirve igual para la licencia, el SOAT y la revisión
        const label = t(`docs.${docNameKey(doc.key, countryCode)}`);
        if (doc.status === 'EXPIRED') return { tone: 'danger', title: t('driverMyLocationMap.seVencio', { label }) };
        return { tone: 'warning', title: t('driverMyLocationMap.venceEn', { label, count: doc.days_left }) };
    }
}
