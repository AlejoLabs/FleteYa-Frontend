import { LatLng } from "react-native-maps";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { DriverPositionUseCases } from "../../../../domain/useCases/driverPosition/DriverPositionUseCases";
import { DriverTripOfferUseCases } from "../../../../domain/useCases/driverTripOffer/DriverTripOfferUseCases";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";
import { SocketService } from "../../../../data/sources/remote/services/SocketService";

export class DriverClientRequestViewModel {

    private clientRequestUseCases: ClientRequestUseCases;
    private driverPositionUseCases: DriverPositionUseCases;
    private driverTripOfferUseCases: DriverTripOfferUseCases;
    private socketService: SocketService;

    constructor(
        {
            clientRequestUseCases,
            driverPositionUseCases,
            driverTripOfferUseCases,
            socketService
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases,
            driverPositionUseCases: DriverPositionUseCases,
            driverTripOfferUseCases: DriverTripOfferUseCases,
            socketService: SocketService
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.driverPositionUseCases = driverPositionUseCases;
        this.driverTripOfferUseCases = driverTripOfferUseCases;
        this.socketService = socketService;
    }

    async getNearbyTripRequest(driverPosition: LatLng) {
        return this.clientRequestUseCases.getNearbyTripRequestUseCase.execute(driverPosition);
    }

    async getDriverPosition(idDriver: number) {
        return await this.driverPositionUseCases.getDriverPosition.execute(idDriver);
    }

    async createDriverTripOffer(driverTripOffer: DriverTripOffer) {
        return await this.driverTripOfferUseCases.create.execute(driverTripOffer);
    }

    listenerNewClientRequestSocket(callback: (data: any) => void){
        return this.socketService.onMessage('created_client_request', (data: any) => {
            callback(data);
        });
    }

    listenerNewDriverAssignedSocket(idDriver: number, callback: (data: any) => void){
        return this.socketService.onMessage(`driver_assigned/${idDriver}`, (data: any) => {
            callback(data);
        });
    }

    emitNewDriverOffer(idClientRequest: number) {
        this.socketService.sendMessage('new_driver_offer', {
            'id_client_request': idClientRequest
        });
    }
}