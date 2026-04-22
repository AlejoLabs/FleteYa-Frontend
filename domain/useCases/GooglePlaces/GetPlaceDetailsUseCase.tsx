import { PlaceDetail } from "../../models/PlaceDetail";
import { GooglePlaceRepository } from "../../repository/GooglePlaceRepository";

export class GetPlaceDetailsUseCase {
    private googlePlaceRepository: GooglePlaceRepository;

    constructor(
        {googlePlaceRepository}: {googlePlaceRepository: GooglePlaceRepository}
    ) {
        this.googlePlaceRepository = googlePlaceRepository;
    }

    async execute(placeId: string): Promise<PlaceDetail | null> {
        return await this.googlePlaceRepository.getPlaceDetails(placeId);
    }
}