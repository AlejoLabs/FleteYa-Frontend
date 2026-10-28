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
}