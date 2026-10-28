import { LatLng } from "react-native-maps";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { PlaceDetail } from "../../../../domain/models/PlaceDetail";
import { PlaceGeocodeDetail } from "../../../../domain/models/PlaceGeocodeDetail";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";
import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequest } from "../../../../domain/models/ClientRequest";
import { DriverTripOfferUseCases } from "../../../../domain/useCases/driverTripOffer/DriverTripOfferUseCases";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";

export class ClientSearchMapViewModel {
    
    private googlePlaceUseCases: GooglePlaceUseCases;
    private clientRequestUseCases: ClientRequestUseCases;
    private socketService: SocketService;
    private driverTripOfferUseCases: DriverTripOfferUseCases;
    private driverCarInfoUseCases: DriverCarInfoUseCases;

    constructor(
        {
            googlePlaceUseCases,
            clientRequestUseCases,
            socketService,
            driverTripOfferUseCases,
            driverCarInfoUseCases
        }: {
            googlePlaceUseCases: GooglePlaceUseCases,
            clientRequestUseCases: ClientRequestUseCases,
            socketService: SocketService,
            driverTripOfferUseCases: DriverTripOfferUseCases,
            driverCarInfoUseCases: DriverCarInfoUseCases
        }
    ) {
        this.googlePlaceUseCases = googlePlaceUseCases;
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
        this.driverTripOfferUseCases = driverTripOfferUseCases;
        this.driverCarInfoUseCases = driverCarInfoUseCases;
    }

    initSocket(){
        if(!this.socketService.getSocket().connected){
            this.socketService.getSocket();
        }
        
       // this.socketService.onMessage('connect', () => {
        //    console.log('Conectado a SOCKET IO');
        //});
    } 
    
    async createClientRequest(clientRequest: ClientRequest): Promise<number | ErrorResponse> {
        return await this.clientRequestUseCases.create.execute(clientRequest);
    }

    async updateDriverAssigned(idClientRequest: number, idDriver: number, fareAssigned: number) {
        return await this.clientRequestUseCases.updateDriverAssigned.execute(idClientRequest, idDriver, fareAssigned);
    }

    async getPlaceDetails(placeId: string): Promise<PlaceDetail | null> {
        return await this.googlePlaceUseCases.getPlaceDetails.execute(placeId);
    }

    async getDriverTripOffers(idClientRequest: number): Promise<DriverTripOffer[] | ErrorResponse> {
        return await this.driverTripOfferUseCases.getDriverTripOffers.execute(idClientRequest);
    }

    async getDriverCarInfo(idDriver: number) {
        return await this.driverCarInfoUseCases.getDriverCarInfo.execute(idDriver);
    }

    async getPlaceDetailsByCoords(lat: number, lng: number): Promise<PlaceGeocodeDetail | null> {
        return await this.googlePlaceUseCases.getPlaceDetailsByCoords.execute(lat, lng);
    }

    async getDirections(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null> {
        return await this.googlePlaceUseCases.getDirections.execute(origin, destination);
    }

    async getTimeAndDistance(origin: LatLng, destination: LatLng, weight?: number, size?: number): Promise<TimeAndDistanceValues | ErrorResponse> {
        return await this.clientRequestUseCases.getTimeAndDistanceUseCase.execute(origin, destination, weight, size);
    }

    emitNewClientRequest(idClientRequest: number) {
        this.socketService.sendMessage('new_client_request', { 
            id_client_request: idClientRequest 
        });
    }

    emitNewDriverAssigned(idClientRequest: number, idDriver: number) {
        this.socketService.sendMessage('new_driver_assigned', { 
            id_client_request: idClientRequest,
            id_driver: idDriver
        });
    }

    listenerDriverPositionSocket(callback: (data: any) => void){
        return this.socketService.onMessage('new_driver_position', (data: any) => {
            callback(data);
        });
    }

    listenerDriverDisconnectSocket(callback: (idSocket: string) => void){
        return this.socketService.onMessage('driver_disconnected', (data: any) => {
            const idSocket = data.id_socket;
            callback(idSocket);
        });
    }

    listenerNewDriverOffer(idClientRequest: number, callback: (data: any) => void){
        return this.socketService.onMessage(`created_driver_offer/${idClientRequest}`, (data: any) => {
            callback(idClientRequest);
        });
    }


}