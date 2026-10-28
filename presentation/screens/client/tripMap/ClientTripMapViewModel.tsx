import { LatLng } from "react-native-maps";
import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { G } from "react-native-svg";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";

export class ClientTripMapViewModel {
    
    private clientRequestUseCases: ClientRequestUseCases;
    private socketService: SocketService;
    private googlePlaceUseCases: GooglePlaceUseCases;
    private driverCarInfoUseCases: DriverCarInfoUseCases;

    constructor(
        {
            clientRequestUseCases,
            socketService,
            googlePlaceUseCases,
            driverCarInfoUseCases
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases,
            socketService: SocketService,
            googlePlaceUseCases: GooglePlaceUseCases,
            driverCarInfoUseCases: DriverCarInfoUseCases
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
        this.googlePlaceUseCases = googlePlaceUseCases;
        this.driverCarInfoUseCases = driverCarInfoUseCases;
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
    listenerTripCanceled(idClientRequest: number, callback: (reason: string) => void) {
        return this.socketService.onMessage(`trip_canceled/${idClientRequest}`, (data: any) => callback(data?.reason ?? ''));
    }

    listenerUpdateStatusSocket(idClientRequest: number, callback: (data: any) => void){
        return this.socketService.onMessage(`new_status_trip/${idClientRequest}`, (data: any) => {
            callback(data);
        });
    }
}