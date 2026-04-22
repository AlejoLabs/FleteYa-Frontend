
import { GooglePlaceServices } from "../sources/remote/services/GooglePlacesService";

export class GooglePlaceRepositoryImpl implements GooglePlaceRepositoryImpl {
    private googlePlaceService: GooglePlaceServices;

    constructor(
        {googlePlaceService}: {googlePlaceService: GooglePlaceServices}
    ) {
        this.googlePlaceService = googlePlaceService;
    }

    async getPlaceDetails(placeId: string) {
        return await this.googlePlaceService.getPlaceDetails(placeId);
    }
}