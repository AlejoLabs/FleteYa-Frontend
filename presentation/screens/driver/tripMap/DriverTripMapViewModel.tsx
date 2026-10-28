import { LatLng } from "react-native-maps";
import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";
import { Status } from "../../../../domain/repository/ClientRequestRepository";

export class DriverTripMapViewModel {
    
    private clientRequestUseCases: ClientRequestUseCases;
    private socketService: SocketService;
    private googlePlaceUseCases: GooglePlaceUseCases;

    constructor(
        {
            clientRequestUseCases,
            socketService,
            googlePlaceUseCases
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases
            socketService: SocketService,
            googlePlaceUseCases: GooglePlaceUseCases
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
        this.googlePlaceUseCases = googlePlaceUseCases;
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