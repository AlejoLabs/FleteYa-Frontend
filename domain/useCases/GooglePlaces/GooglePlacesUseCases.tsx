import { GetPlaceDetailsUseCase } from "./GetPlaceDetailsUseCase";


export class GooglePlaceUseCases {

    getPlaceDetails: GetPlaceDetailsUseCase;

    constructor(
        {getPlaceDetailsUseCase}: {getPlaceDetailsUseCase: GetPlaceDetailsUseCase}
    ) {
        this.getPlaceDetails = getPlaceDetailsUseCase;
    }
}