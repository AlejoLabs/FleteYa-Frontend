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
        if(!this.socketService.getSocket().connected){
            this.socketService.getSocket();
        }
        
       // this.socketService.onMessage('connect', () => {
        //    console.log('Conectado a SOCKET IO');
        //});
    }

    discconectSocket(){
        this.socketService.disconnect();
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

    emitDriverPosition(idClient: number, lat: number, lng: number){
        this.socketService.sendMessage('trip_change_driver_position', {
            'id_client': idClient,
            'lat': lat,
            'lng': lng
        });
    }
}