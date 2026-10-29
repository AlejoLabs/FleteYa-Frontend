import { LatLng } from "react-native-maps";
import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";
import { Status } from "../../../../domain/repository/ClientRequestRepository";
import { PhotoUseCases } from "../../../../domain/useCases/photo/PhotoUseCases";
import { TripPhotoKind } from "../../../../domain/models/Photo";
import { TripMessageUseCases } from "../../../../domain/useCases/tripMessage/TripMessageUseCases";

export interface DriverStep {
    status: Status;
    label: string;
}

// Siguiente paso del viaje para el conductor: llegar al origen, recoger la carga y entregarla.
// Recoger pide una foto de la carga; entregar abre la prueba de entrega (foto y código)
const NEXT_STEP: Partial<Record<string, DriverStep>> = {
    [Status.ACCEPTED]: { status: Status.ARRIVED, label: 'Avisar que llegué' },
    [Status.ON_THE_WAY]: { status: Status.ARRIVED, label: 'Avisar que llegué' },
    [Status.ARRIVED]: { status: Status.TRAVELING, label: 'Tomar foto y salir' },
    [Status.TRAVELING]: { status: Status.FINISHED, label: 'Entregar carga' },
};

const STATUS_TEXT: Partial<Record<string, { title: string; hint: string }>> = {
    [Status.ACCEPTED]: { title: 'Ve a recoger la carga', hint: 'Cuando llegues, avísale al cliente desde aquí.' },
    [Status.ON_THE_WAY]: { title: 'Ve a recoger la carga', hint: 'Cuando llegues, avísale al cliente desde aquí.' },
    [Status.ARRIVED]: { title: 'Estás en la recogida', hint: 'Sube la carga y tómale una foto ya en el vehículo.' },
    [Status.TRAVELING]: { title: 'Lleva la carga al destino', hint: 'Al entregar, pide el código a quien recibe.' },
};

export class DriverTripMapViewModel {
    
    private clientRequestUseCases: ClientRequestUseCases;
    private socketService: SocketService;
    private googlePlaceUseCases: GooglePlaceUseCases;
    private photoUseCases: PhotoUseCases;
    private tripMessageUseCases: TripMessageUseCases;

    constructor(
        {
            clientRequestUseCases,
            socketService,
            googlePlaceUseCases,
            photoUseCases,
            tripMessageUseCases
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases
            socketService: SocketService,
            googlePlaceUseCases: GooglePlaceUseCases,
            photoUseCases: PhotoUseCases,
            tripMessageUseCases: TripMessageUseCases
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
        this.googlePlaceUseCases = googlePlaceUseCases;
        this.photoUseCases = photoUseCases;
        this.tripMessageUseCases = tripMessageUseCases;
    }

    nextStep(status: string): DriverStep | null {
        return NEXT_STEP[status] ?? null;
    }

    statusText(status: string) {
        return STATUS_TEXT[status] ?? { title: 'Viaje en curso', hint: '' };
    }

    // Mensajes del chat que le llegaron a esta persona y todavía no abre
    async countUnreadMessages(idClientRequest: number, myId: number) {
        const response = await this.tripMessageUseCases.getMessages.execute(idClientRequest);
        return Array.isArray(response) ? response.filter((message) => message.id_sender !== myId && !message.read_at).length : 0;
    }

    listenerTripMessage(idClientRequest: number, callback: () => void) {
        return this.socketService.onMessage(`trip_message/${idClientRequest}`, () => callback());
    }

    // Prueba de entrega: foto al cargar (PICKUP) y al entregar (DELIVERY)
    async uploadTripPhoto(idClientRequest: number, kind: TripPhotoKind, uri: string) {
        return await this.photoUseCases.uploadTripPhoto.execute(idClientRequest, kind, uri);
    }

    async deliver(idClientRequest: number, code: string) {
        return await this.clientRequestUseCases.deliver.execute(idClientRequest, code);
    }

    // El cliente puede confirmar la entrega desde su app; el servidor avisa con el estado nuevo
    listenerTripFinished(idClientRequest: number, callback: () => void) {
        return this.socketService.onMessage(`new_status_trip/${idClientRequest}`, (data: any) => {
            if (data?.status === 'FINISHED') callback();
        });
    }

    initSocket(){
        this.socketService.connect();
    }

    // Al dejar de rastrear el viaje no se cierra el socket compartido: lo siguen usando las demás pantallas del conductor
    discconectSocket(){
        this.socketService.sendMessage('driver_offline', {});
    }

    async getClientRequestById(idClientRequest: number) {
        return await this.clientRequestUseCases.getClientRequestById.execute(idClientRequest);
    }
    

    async getDirections(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null> {
            return await this.googlePlaceUseCases.getDirections.execute(origin, destination);
    }

    async updateStatus(idClientRequest: number, status: Status) {
        return await this.clientRequestUseCases.updateStatus.execute(idClientRequest, status);
    }

    async cancelTrip(idClientRequest: number, reason: string) {
        return await this.clientRequestUseCases.cancel.execute(idClientRequest, reason);
    }

    // El servidor avisa si el cliente cancela mientras el conductor va en camino
    listenerTripCanceled(idClientRequest: number, callback: (reason: string) => void) {
        return this.socketService.onMessage(`trip_canceled/${idClientRequest}`, (data: any) => callback(data?.reason ?? ''));
    }

    emitDriverPosition(idClient: number, lat: number, lng: number){
        this.socketService.sendMessage('trip_change_driver_position', {
            'id_client': idClient,
            'lat': lat,
            'lng': lng
        });
    }

    emitUpdateStatus(idClientRequest: number, status: Status){
        this.socketService.sendMessage('update_status_trip', {
            'id_client_request': idClientRequest,
            'status': status
        });
    }
}