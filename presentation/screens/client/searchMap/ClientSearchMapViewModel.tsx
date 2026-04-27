import { LatLng } from "react-native-maps";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { PlaceDetail } from "../../../../domain/models/PlaceDetail";
import { PlaceGeocodeDetail } from "../../../../domain/models/PlaceGeocodeDetail";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";

export class ClientSearchMapViewModel {
    private googlePlaceUseCases: GooglePlaceUseCases;
    private clientRequestUseCases: ClientRequestUseCases;

    constructor(
        {
            googlePlaceUseCases,
            clientRequestUseCases
        }: {
            googlePlaceUseCases: GooglePlaceUseCases,
            clientRequestUseCases: ClientRequestUseCases
        }
    ) {
        this.googlePlaceUseCases = googlePlaceUseCases;
        this.clientRequestUseCases = clientRequestUseCases;
    }

    async getPlaceDetails(placeId: string): Promise<PlaceDetail | null> {
        return await this.googlePlaceUseCases.getPlaceDetails.execute(placeId);
    }

    async getPlaceDetailsByCoords(lat: number, lng: number): Promise<PlaceGeocodeDetail | null> {
        return await this.googlePlaceUseCases.getPlaceDetailsByCoords.execute(lat, lng);
    }

    async getDirections(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null> {
        return await this.googlePlaceUseCases.getDirections.execute(origin, destination);
    }

    async getTimeAndDistance(origin: LatLng, destination: LatLng): Promise<TimeAndDistanceValues | ErrorResponse> {
        return await this.clientRequestUseCases.getTimeAndDistanceUseCase.execute(origin, destination);
    }
}