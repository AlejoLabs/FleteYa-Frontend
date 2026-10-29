import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { DriverDocument } from "../../../../domain/models/DriverDocument";
import { DriverPosition } from "../../../../domain/models/DriverPosition";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";
import { DriverPositionUseCases } from "../../../../domain/useCases/driverPosition/DriverPositionUseCases";
import { vehicleLabel } from "../../../utils/Cargo";
import { getTripFare } from "../../../utils/Formatters";

export interface DaySummary {
    earned: number;
    trips: number;
}

export interface DocumentAlert {
    tone: 'warning' | 'danger';
    title: string;
}

// Inicio del conductor: disponibilidad (GPS y socket), lo ganado hoy, sus documentos y cuántas solicitudes tiene cerca
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

    async countNearbyRequests(latitude: number, longitude: number) {
        const response = await this.clientRequestUseCases.getNearbyTripRequestUseCase.execute({ latitude, longitude });
        return Array.isArray(response) ? response.length : null;
    }

    // Lo cobrado en los fletes entregados hoy, con la fecha del teléfono. En bruto: la Fase 7 le resta la comisión
    daySummary(trips: ClientRequestResponse[], now = new Date()): DaySummary {
        const today = trips.filter((trip) => new Date(trip.update_at).toDateString() === now.toDateString());
        return { earned: today.reduce((sum, trip) => sum + getTripFare(trip), 0), trips: today.length };
    }

    // Promedio de las estrellas que le dieron los clientes, igual que lo calcula el servidor para las ofertas
    rating(trips: ClientRequestResponse[]) {
        const stars = trips.map((trip) => trip.driver_rating).filter((value): value is number => typeof value === 'number');
        if (!stars.length) return { average: null, count: 0 };
        return { average: Math.round(stars.reduce((sum, value) => sum + value, 0) / stars.length * 10) / 10, count: stars.length };
    }

    // "Furgón · VES129"
    vehicleText(carInfo: DriverCarInfo | null) {
        if (!carInfo) return 'Registra tu vehículo';
        return `${vehicleLabel(carInfo.vehicle_type)} · ${carInfo.plate}`;
    }

    // El documento que más urge: primero uno vencido, si no el que vence antes
    documentAlert(documents: DriverDocument[]): DocumentAlert | null {
        const pending = documents.filter((doc) => doc.status !== 'OK').sort((a, b) => a.days_left - b.days_left);
        const doc = pending[0];
        if (!doc) return null;
        // "Se venció" y no "vencido/vencida": sirve igual para la licencia, el SOAT y la revisión
        if (doc.status === 'EXPIRED') return { tone: 'danger', title: `Se venció: ${doc.label}.` };
        return { tone: 'warning', title: `${doc.label} vence en ${doc.days_left} ${doc.days_left === 1 ? 'día' : 'días'}.` };
    }
}
