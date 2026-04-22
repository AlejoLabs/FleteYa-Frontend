
import { PlaceGeocodeDetail } from "../../domain/models/PlaceGeocodeDetail";
import { GooglePlaceRepository } from "../../domain/repository/GooglePlaceRepository";
import { GooglePlaceServices } from "../sources/remote/services/GooglePlacesService";

export class GooglePlaceRepositoryImpl implements GooglePlaceRepository{
    private googlePlaceService: GooglePlaceServices;

    constructor(
        {googlePlaceService}: {googlePlaceService: GooglePlaceServices}
    ) {
        this.googlePlaceService = googlePlaceService;
    }
    getPlaceDetailsByCoords(lat: number, lng: number): Promise<PlaceGeocodeDetail | null> {
        return this.googlePlaceService.getPlaceDetailByCoords(lat, lng);
    }

    async getPlaceDetails(placeId: string) {
        return await this.googlePlaceService.getPlaceDetails(placeId);
    }
}