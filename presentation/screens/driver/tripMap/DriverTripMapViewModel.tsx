import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";

export class DriverTripMapViewModel {
    
    private clientRequestUseCases: ClientRequestUseCases;
    private socketService: SocketService;

    constructor(
        {
            clientRequestUseCases,
            socketService
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases
            socketService: SocketService
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
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

    emitDriverPosition(idClient: number, lat: number, lng: number){
        this.socketService.sendMessage('trip_change_driver_position', {
            'id_client': idClient,
            'lat': lat,
            'lng': lng
        });
    }
}