import { LatLng } from "react-native-maps";
import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";
import { PhotoUseCases } from "../../../../domain/useCases/photo/PhotoUseCases";
import { TripMessageUseCases } from "../../../../domain/useCases/tripMessage/TripMessageUseCases";
import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { Status } from "../../../../domain/repository/ClientRequestRepository";
import { arrivalTime } from "../../trip/TripStatus";
import { t } from '../../../../i18n';

export class ClientTripMapViewModel {
    
    private clientRequestUseCases: ClientRequestUseCases;
    private socketService: SocketService;
    private googlePlaceUseCases: GooglePlaceUseCases;
    private driverCarInfoUseCases: DriverCarInfoUseCases;
    private photoUseCases: PhotoUseCases;
    private tripMessageUseCases: TripMessageUseCases;

    constructor(
        {
            clientRequestUseCases,
            socketService,
            googlePlaceUseCases,
            driverCarInfoUseCases,
            photoUseCases,
            tripMessageUseCases
        }:
        {
            clientRequestUseCases: ClientRequestUseCases,
            socketService: SocketService,
            googlePlaceUseCases: GooglePlaceUseCases,
            driverCarInfoUseCases: DriverCarInfoUseCases,
            photoUseCases: PhotoUseCases,
            tripMessageUseCases: TripMessageUseCases
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
        this.googlePlaceUseCases = googlePlaceUseCases;
        this.driverCarInfoUseCases = driverCarInfoUseCases;
        this.photoUseCases = photoUseCases;
        this.tripMessageUseCases = tripMessageUseCases;
    }

    // Qué está pasando con el flete y, si hay ruta, a qué hora llega el vehículo al punto que toca
    statusText(status: string, etaMinutes: number | null) {
        const eta = etaMinutes !== null ? t('clientTripMap.cercaDeLasUnosMin', { arrivalTime: arrivalTime(etaMinutes), etaMinutes }) : null;
        switch (status) {
            case Status.ARRIVED:
                return { title: t('clientTripMap.tuConductorLlego'), hint: t('clientTripMap.teEsperaEnElPunto') };
            case Status.TRAVELING:
                return { title: t('clientTripMap.tuCargaVaEnCamino'), hint: eta ? t('clientTripMap.llegaAlDestino', { eta }) : t('clientTripMap.elConductorVaHaciaEl') };
            default:
                return { title: t('clientTripMap.tuConductorVaEnCamino'), hint: eta ? t('clientTripMap.llegaALaRecogida', { eta }) : t('clientTripMap.esperandoLaUbicacionDelConductor') };
        }
    }

    // "Furgón JAC blanco · VES129"
    vehicleText(carInfo: DriverCarInfo | null) {
        if (!carInfo) return t('clientTripMap.vehiculoSinRegistrar');
        return [[carInfo.brand, carInfo.color].filter(Boolean).join(' '), carInfo.plate].filter(Boolean).join(' · ');
    }

    // Mensajes del chat que le llegaron a esta persona y todavía no abre
    async countUnreadMessages(idClientRequest: number, myId: number) {
        const response = await this.tripMessageUseCases.getMessages.execute(idClientRequest);
        return Array.isArray(response) ? response.filter((message) => message.id_sender !== myId && !message.read_at).length : 0;
    }

    listenerTripMessage(idClientRequest: number, callback: () => void) {
        return this.socketService.onMessage(`trip_message/${idClientRequest}`, () => callback());
    }

    async getTripPhotos(idClientRequest: number) {
        return await this.photoUseCases.getTripPhotos.execute(idClientRequest);
    }

    async confirmDelivery(idClientRequest: number) {
        return await this.clientRequestUseCases.confirmDelivery.execute(idClientRequest);
    }

    // El conductor tomó una foto al cargar o al entregar: se recarga la lista
    listenerTripPhoto(idClientRequest: number, callback: () => void) {
        return this.socketService.onMessage(`trip_photo/${idClientRequest}`, () => callback());
    }

    initSocket(){
        this.socketService.connect();
    }

    async getClientRequestById(idClientRequest: number) {
        return await this.clientRequestUseCases.getClientRequestById.execute(idClientRequest);
    }

    async getDriverCarInfo(idDriver: number) {
        return await this.driverCarInfoUseCases.getDriverCarInfo.execute(idDriver);
    }

    async getDirections(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null> {
                return await this.googlePlaceUseCases.getDirections.execute(origin, destination);
    }

    listenerDriverPositionSocket(idClient: number, idDriver: number, callback: (data: any) => void){
        const offTrip = this.socketService.onMessage(`trip_new_driver_position/${idClient}`, (data: any) => {
            callback(data);
        });

        // fallback: mismo canal que usa la pantalla de búsqueda; trae a todos los conductores, así que se filtra por el asignado
        const offAll = this.socketService.onMessage('new_driver_position', (data: any) => {
            if (data?.id === idDriver) callback(data);
        });

        return () => {
            offTrip();
            offAll();
        };
    }

    async cancelTrip(idClientRequest: number, reason: string) {
        return await this.clientRequestUseCases.cancel.execute(idClientRequest, reason);
    }

    // El servidor avisa si el conductor cancela el viaje
    // El conductor se equivocó 5 veces con el código: el cliente pasa a poder confirmar la entrega
    listenerDeliveryLocked(idClientRequest: number, callback: () => void) {
        return this.socketService.onMessage(`delivery_locked/${idClientRequest}`, callback);
    }

    listenerTripCanceled(idClientRequest: number, callback: (reason: string) => void) {
        return this.socketService.onMessage(`trip_canceled/${idClientRequest}`, (data: any) => callback(data?.reason ?? ''));
    }

    listenerUpdateStatusSocket(idClientRequest: number, callback: (data: any) => void){
        return this.socketService.onMessage(`new_status_trip/${idClientRequest}`, (data: any) => {
            callback(data);
        });
    }
}