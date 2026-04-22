
import { LatLng } from "react-native-maps";
import { GoogleDirections } from "../../domain/models/GoogleDirections";
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
    getDirections(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null> {
        return this.googlePlaceService.getDirections(origin, destination);
    }
    getPlaceDetailsByCoords(lat: number, lng: number): Promise<PlaceGeocodeDetail | null> {
        return this.googlePlaceService.getPlaceDetailByCoords(lat, lng);
    }

    async getPlaceDetails(placeId: string) {
        return await this.googlePlaceService.getPlaceDetails(placeId);
    }
}