import { LatLng } from "react-native-maps";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { PlaceDetail } from "../../../../domain/models/PlaceDetail";
import { PlaceGeocodeDetail } from "../../../../domain/models/PlaceGeocodeDetail";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";
import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { ClientRequest, VehicleType } from "../../../../domain/models/ClientRequest";
import { DriverTripOfferUseCases } from "../../../../domain/useCases/driverTripOffer/DriverTripOfferUseCases";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";
import { PhotoUseCases } from "../../../../domain/useCases/photo/PhotoUseCases";
import { PlacePrediction } from "../../../../domain/models/PlacePrediction";
import { DraftErrors, RequestDraft, toClientRequest, validateStep } from "./RequestDraft";
import { CountryUseCases } from "../../../../domain/useCases/country/CountryUseCases";
import { CountryAtPoint } from "../../../../domain/models/Country";
import { currencyRules, roundToStep } from "../../../utils/Countries";

export class ClientSearchMapViewModel {
    
    private googlePlaceUseCases: GooglePlaceUseCases;
    private clientRequestUseCases: ClientRequestUseCases;
    private socketService: SocketService;
    private driverTripOfferUseCases: DriverTripOfferUseCases;
    private driverCarInfoUseCases: DriverCarInfoUseCases;
    private photoUseCases: PhotoUseCases;
    private countryUseCases: CountryUseCases;

    constructor(
        {
            googlePlaceUseCases,
            clientRequestUseCases,
            socketService,
            driverTripOfferUseCases,
            driverCarInfoUseCases,
            photoUseCases,
            countryUseCases
        }: {
            googlePlaceUseCases: GooglePlaceUseCases,
            clientRequestUseCases: ClientRequestUseCases,
            socketService: SocketService,
            driverTripOfferUseCases: DriverTripOfferUseCases,
            driverCarInfoUseCases: DriverCarInfoUseCases,
            photoUseCases: PhotoUseCases,
            countryUseCases: CountryUseCases
        }
    ) {
        this.googlePlaceUseCases = googlePlaceUseCases;
        this.clientRequestUseCases = clientRequestUseCases;
        this.socketService = socketService;
        this.driverTripOfferUseCases = driverTripOfferUseCases;
        this.driverCarInfoUseCases = driverCarInfoUseCases;
        this.photoUseCases = photoUseCases;
        this.countryUseCases = countryUseCases;
    }

    initSocket(){
        this.socketService.connect();
    }
    
    validateStep(step: number, draft: RequestDraft, pickupCountry?: CountryAtPoint | null): DraftErrors {
        return validateStep(step, draft, pickupCountry);
    }

    // El precio sugerido del backend redondeado como se muestra y se ofrece: en pesos a cientos, en las demás
    // monedas a unidades enteras (27 €, no 27,34 €)
    recommendedFare(values?: TimeAndDistanceValues): number {
        const value = values?.recommended_value ?? 0;
        const rules = currencyRules(values?.country?.currency);
        return roundToStep(value, rules.decimals === 0 ? rules.fare_step / 10 : 1);
    }

    // País de un punto, según el backend (supported false: FleteYa no opera ahí)
    async getCountryAt(lat: number, lng: number): Promise<CountryAtPoint | ErrorResponse> {
        return await this.countryUseCases.getCountryAt.execute(lat, lng);
    }

    // Crea la solicitud, sube las fotos y solo entonces avisa a los conductores, para que les llegue con ellas
    async publish(draft: RequestDraft, idClient: number): Promise<{ id: number; failedPhotos: number } | ErrorResponse> {
        const response = await this.createClientRequest(toClientRequest(draft, idClient));
        if (typeof response !== 'number') return response;
        const failedPhotos = draft.photos.length ? await this.uploadCargoPhotos(response, draft.photos) : 0;
        this.emitNewClientRequest(response);
        return { id: response, failedPhotos };
    }

    async createClientRequest(clientRequest: ClientRequest): Promise<number | ErrorResponse> {
        return await this.clientRequestUseCases.create.execute(clientRequest);
    }

    // Sube las fotos de la carga una por una y devuelve cuántas fallaron (la solicitud ya quedó creada igual)
    async uploadCargoPhotos(idClientRequest: number, uris: string[]): Promise<number> {
        let failed = 0;
        for (const uri of uris) {
            const response = await this.photoUseCases.uploadTripPhoto.execute(idClientRequest, 'CARGO', uri);
            if ('statusCode' in response) failed++;
        }
        return failed;
    }

    async updateDriverAssigned(idClientRequest: number, idDriver: number, fareAssigned: number) {
        return await this.clientRequestUseCases.updateDriverAssigned.execute(idClientRequest, idDriver, fareAssigned);
    }

    // Sugerencias para lo que se escribe; null si Google no respondió (sin conexión, llave rechazada)
    // country: el país de la recogida; las direcciones se buscan ahí
    async searchPlaces(input: string, country?: string | null): Promise<PlacePrediction[] | null> {
        const response = await this.googlePlaceUseCases.searchPlaces.execute(input.trim(), country);
        if (!response || (response.status !== 'OK' && response.status !== 'ZERO_RESULTS')) return null;
        return response.predictions;
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

    async getTimeAndDistance(origin: LatLng, destination: LatLng, weight?: number, size?: number, vehicle?: VehicleType): Promise<TimeAndDistanceValues | ErrorResponse> {
        return await this.clientRequestUseCases.getTimeAndDistanceUseCase.execute(origin, destination, weight, size, vehicle);
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

    async getClientRequestById(idClientRequest: number) {
        return await this.clientRequestUseCases.getClientRequestById.execute(idClientRequest);
    }

    async raiseFare(idClientRequest: number, fare: number) {
        return await this.clientRequestUseCases.raiseFare.execute(idClientRequest, fare);
    }

    async cancelClientRequest(idClientRequest: number, reason: string) {
        return await this.clientRequestUseCases.cancel.execute(idClientRequest, reason);
    }

    async rejectDriverTripOffer(idOffer: number) {
        return await this.driverTripOfferUseCases.changeStatus.execute(idOffer, 'reject');
    }

    // Vencimiento de la búsqueda: lo avisa el servidor cuando pasan los 10 minutos sin conductor
    listenerClientRequestExpired(idClientRequest: number, callback: () => void) {
        return this.socketService.onMessage(`client_request_expired/${idClientRequest}`, () => callback());
    }

    listenerNewDriverOffer(idClientRequest: number, callback: (data: any) => void){
        return this.socketService.onMessage(`created_driver_offer/${idClientRequest}`, (data: any) => {
            callback(idClientRequest);
        });
    }


}