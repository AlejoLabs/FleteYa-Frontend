import { PlaceDetail } from "../../models/PlaceDetail";
import { PlaceGeocodeDetail } from "../../models/PlaceGeocodeDetail";
import { GooglePlaceRepository } from "../../repository/GooglePlaceRepository";

export class GetPlaceDetailsByCoordsUseCase {
    private googlePlaceRepository: GooglePlaceRepository;

    constructor(
        {googlePlaceRepository}: {googlePlaceRepository: GooglePlaceRepository}
    ) {
        this.googlePlaceRepository = googlePlaceRepository;
    }

    async execute(lat: number, lng: number): Promise<PlaceGeocodeDetail | null> {
        return await this.googlePlaceRepository.getPlaceDetailsByCoords(lat, lng);
    }
}