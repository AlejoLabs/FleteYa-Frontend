import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";

export class DriverMyLocationMapViewModel {
    private googlePlaceUseCases: GooglePlaceUseCases;
    private clientRequestUseCases: ClientRequestUseCases;
    private socketService: SocketService;

    constructor(
        {
            googlePlaceUseCases,
            clientRequestUseCases,
            socketService
        }: {
            googlePlaceUseCases: GooglePlaceUseCases,
            clientRequestUseCases: ClientRequestUseCases,
            socketService: SocketService
        }
    ) {
        this.googlePlaceUseCases = googlePlaceUseCases;
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
    }

    initSocket(){
        if(!this.socketService.getSocket().connected){
            this.socketService.getSocket().connect();
        }
        
        //this.socketService.onMessage('connect', () => {
          //  console.log('Conectado a SOCKET IO');
        //});
    } 
    
    emitDriverPosition(id: number, lat: number, lng: number){
        this.socketService.sendMessage('change_driver_position', {
            'id': id,
            'lat': lat,
            'lng': lng
        });
    }

    discconectSocket(){
        this.socketService.disconnect();
    }
}