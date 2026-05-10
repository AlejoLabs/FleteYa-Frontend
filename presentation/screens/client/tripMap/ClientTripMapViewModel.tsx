import { LatLng } from "react-native-maps";
import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { G } from "react-native-svg";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";

export class ClientTripMapViewModel {
    
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
            clientRequestUseCases: ClientRequestUseCases,
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
            this.socketService.getSocket().connect();
        }
        
        //this.socketService.onMessage('connect', () => {
          //  console.log('Conectado a SOCKET IO');
        //});
    } 

    async getClientRequestById(idClientRequest: number) {
        return await this.clientRequestUseCases.getClientRequestById.execute(idClientRequest);
    }

    async getDirections(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null> {
                return await this.googlePlaceUseCases.getDirections.execute(origin, destination);
    }

    listenerDriverPositionSocket(idClient: number, callback: (data: any) => void){
        this.socketService.onMessage(`trip_new_driver_position/${idClient}`, (data: any) => {
            
            callback(data);
        });
    }

    listenerUpdateStatusSocket(idClientRequest: number, callback: (data: any) => void){
        this.socketService.onMessage(`new_status_trip/${idClientRequest}`, (data: any) => { 
            callback(data);
        });
    }
}