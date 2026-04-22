import { PlaceDetail } from "../../../../domain/models/PlaceDetail";
import { PlaceGeocodeDetail } from "../../../../domain/models/PlaceGeocodeDetail";
import { GooglePlaceUseCases } from "../../../../domain/useCases/GooglePlaces/GooglePlacesUseCases";

export class ClientSearchMapViewModel {
    private googlePlaceUseCases: GooglePlaceUseCases;

    constructor(
        {googlePlaceUseCases}: {googlePlaceUseCases: GooglePlaceUseCases}
    ) {
        this.googlePlaceUseCases = googlePlaceUseCases;
    }

    async getPlaceDetails(placeId: string): Promise<PlaceDetail | null> {
        return await this.googlePlaceUseCases.getPlaceDetails.execute(placeId);
    }

    async getPlaceDetailsByCoords(lat: number, lng: number): Promise<PlaceGeocodeDetail | null> {
        return await this.googlePlaceUseCases.getPlaceDetailsByCoords.execute(lat, lng);
    }
}