import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";

export class ClientTripMapViewModel {
    
    private clientRequestUseCases: ClientRequestUseCases;
    private socketService: SocketService;

    constructor(
        {
            clientRequestUseCases,
            socketService
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases,
            socketService: SocketService
        }
    ) {
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

    async getClientRequestById(idClientRequest: number) {
        return await this.clientRequestUseCases.getClientRequestById.execute(idClientRequest);
    }

    listenerDriverPositionSocket(idClient: number, callback: (data: any) => void){
        this.socketService.onMessage(`trip_new_driver_position/${idClient}`, (data: any) => {
            
            callback(data);
        });
    }
}