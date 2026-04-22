import { LatLng } from "react-native-maps";
import { GoogleDirections } from "../../models/GoogleDirections";
import { PlaceDetail } from "../../models/PlaceDetail";
import { GooglePlaceRepository } from "../../repository/GooglePlaceRepository";

export class GetDirectionsUseCase {
    private googlePlaceRepository: GooglePlaceRepository;

    constructor(
        {googlePlaceRepository}: {googlePlaceRepository: GooglePlaceRepository}
    ) {
        this.googlePlaceRepository = googlePlaceRepository;
    }

    async execute(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null> {
        return await this.googlePlaceRepository.getDirections(origin, destination);
    }
}