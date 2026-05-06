import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { DriverPosition } from "../../../../domain/models/DriverPosition";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { DriverPositionUseCases } from "../../../../domain/useCases/driverPosition/DriverPositionUseCases";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";

export class DriverMyLocationMapViewModel {
    private googlePlaceUseCases: GooglePlaceUseCases;
    private clientRequestUseCases: ClientRequestUseCases;
    private driverPositionUseCases: DriverPositionUseCases;
    private socketService: SocketService;

    constructor(
        {
            googlePlaceUseCases,
            clientRequestUseCases,
            socketService,
            driverPositionUseCases
        }: {
            googlePlaceUseCases: GooglePlaceUseCases,
            clientRequestUseCases: ClientRequestUseCases,
            socketService: SocketService,
            driverPositionUseCases: DriverPositionUseCases
        }
    ) {
        this.googlePlaceUseCases = googlePlaceUseCases;
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
        this.driverPositionUseCases = driverPositionUseCases;
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

    async createDriverPosition(driverPosition: DriverPosition) {
        return await this.driverPositionUseCases.create.execute(driverPosition);
    }
}