import { GetDirectionsUseCase } from "./GetDirectionsUseCase";
import { GetPlaceDetailsByCoordsUseCase } from "./GetPlaceDetailsByCoordsUseCase";
import { GetPlaceDetailsUseCase } from "./GetPlaceDetailsUseCase";


export class GooglePlaceUseCases {

    getPlaceDetails: GetPlaceDetailsUseCase;
    getPlaceDetailsByCoords: GetPlaceDetailsByCoordsUseCase;
    getDirections: GetDirectionsUseCase;

    constructor( 
        {
            getPlaceDetailsUseCase,
            getPlaceDetailsByCoordsUseCase,
            getDirectionsUseCase
        }: 
        {
            getPlaceDetailsUseCase: GetPlaceDetailsUseCase,
            getPlaceDetailsByCoordsUseCase: GetPlaceDetailsByCoordsUseCase,
            getDirectionsUseCase: GetDirectionsUseCase
        }
    ) {
        this.getPlaceDetails = getPlaceDetailsUseCase; 
        this.getPlaceDetailsByCoords = getPlaceDetailsByCoordsUseCase;
        this.getDirections = getDirectionsUseCase;
    }
}