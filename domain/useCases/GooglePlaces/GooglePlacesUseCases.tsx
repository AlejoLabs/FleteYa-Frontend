import { GetPlaceDetailsByCoordsUseCase } from "./GetPlaceDetailsByCoordsUseCase";
import { GetPlaceDetailsUseCase } from "./GetPlaceDetailsUseCase";


export class GooglePlaceUseCases {

    getPlaceDetails: GetPlaceDetailsUseCase;
    getPlaceDetailsByCoords: GetPlaceDetailsByCoordsUseCase;

    constructor( 
        {
            getPlaceDetailsUseCase,
            getPlaceDetailsByCoordsUseCase
        }: 
        {
            getPlaceDetailsUseCase: GetPlaceDetailsUseCase,
            getPlaceDetailsByCoordsUseCase: GetPlaceDetailsByCoordsUseCase
        }
    ) {
        this.getPlaceDetails = getPlaceDetailsUseCase; 
        this.getPlaceDetailsByCoords = getPlaceDetailsByCoordsUseCase;
    }
}