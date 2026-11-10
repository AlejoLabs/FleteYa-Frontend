import { PlaceAutocomplete } from "../../models/PlacePrediction";
import { GooglePlaceRepository } from "../../repository/GooglePlaceRepository";

export class SearchPlacesUseCase {
    private googlePlaceRepository: GooglePlaceRepository;

    constructor(
        {googlePlaceRepository}: {googlePlaceRepository: GooglePlaceRepository}
    ) {
        this.googlePlaceRepository = googlePlaceRepository;
    }

    async execute(input: string, country?: string | null): Promise<PlaceAutocomplete | null> {
        return await this.googlePlaceRepository.searchPlaces(input, country);
    }
}
