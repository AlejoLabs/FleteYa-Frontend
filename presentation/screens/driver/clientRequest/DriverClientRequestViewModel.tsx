import { LatLng } from "react-native-maps";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { DriverPositionUseCases } from "../../../../domain/useCases/driverPosition/DriverPositionUseCases";
import { DriverTripOfferUseCases } from "../../../../domain/useCases/driverTripOffer/DriverTripOfferUseCases";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";
import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { PhotoUseCases } from "../../../../domain/useCases/photo/PhotoUseCases";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";

export class DriverClientRequestViewModel {

    private clientRequestUseCases: ClientRequestUseCases;
    private driverPositionUseCases: DriverPositionUseCases;
    private driverTripOfferUseCases: DriverTripOfferUseCases;
    private socketService: SocketService;
    private photoUseCases: PhotoUseCases;

    constructor(
        {
            clientRequestUseCases,
            driverPositionUseCases,
            driverTripOfferUseCases,
            socketService,
            photoUseCases
        }:
        {
            clientRequestUseCases: ClientRequestUseCases,
            driverPositionUseCases: DriverPositionUseCases,
            driverTripOfferUseCases: DriverTripOfferUseCases,
            socketService: SocketService,
            photoUseCases: PhotoUseCases
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.driverPositionUseCases = driverPositionUseCases;
        this.driverTripOfferUseCases = driverTripOfferUseCases;
        this.socketService = socketService;
        this.photoUseCases = photoUseCases;
    }

    async getTripPhotos(idClientRequest: number) {
        return await this.photoUseCases.getTripPhotos.execute(idClientRequest);
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

    // Oferta del conductor (aceptar el precio del cliente o contraofertar). Si se guarda, el cliente la recibe por el socket
    async sendOffer(idDriver: number, request: ClientRequestResponse, fare: number) {
        const response = await this.createDriverTripOffer({
            id_driver: idDriver,
            id_client_request: request.id,
            fare_offered: fare,
            distance: request.google_distance_matrix.distance.value / 1000,
            time: request.google_distance_matrix.duration.value / 60,
        });
        if ('id_client_request' in response) this.emitNewDriverOffer(request.id);
        return response;
    }

    // "Llegas en 12 min · a 3,6 km" del conductor al punto de recogida
    arrivalText(request: ClientRequestResponse) {
        const { distance, duration } = request.google_distance_matrix;
        const minutes = Math.max(1, Math.round(duration.value / 60));
        const km = (distance.value / 1000).toFixed(1).replace('.', ',');
        return `Llegas en ${minutes} min · a ${km} km`;
    }

    // Cómo cobra el conductor al entregar; lo ve antes de ofertar
    paymentText(request: ClientRequestResponse) {
        return request.payment_method === 'WOMPI' ? 'Paga por la app' : 'Paga en efectivo';
    }

    async dismissClientRequest(idClientRequest: number) {
        return await this.clientRequestUseCases.dismiss.execute(idClientRequest);
    }

    // Cambios que obligan a recargar la lista: una solicitud sale (asignada, cancelada, vencida) o sube de precio
    listenerClientRequestsChanged(callback: () => void) {
        const offRemoved = this.socketService.onMessage('client_request_removed', () => callback());
        const offUpdated = this.socketService.onMessage('client_request_updated', () => callback());
        return () => {
            offRemoved();
            offUpdated();
        };
    }

    // El cliente rechazó la oferta de este conductor o eligió a otro
    listenerOfferStatus(idDriver: number, callback: (data: { id_client_request: number; status: string; reason: string }) => void) {
        return this.socketService.onMessage(`offer_status/${idDriver}`, (data: any) => callback(data));
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