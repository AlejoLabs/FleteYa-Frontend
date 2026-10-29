import { GetDirectionsUseCase } from "./GetDirectionsUseCase";
import { GetPlaceDetailsByCoordsUseCase } from "./GetPlaceDetailsByCoordsUseCase";
import { GetPlaceDetailsUseCase } from "./GetPlaceDetailsUseCase";
import { SearchPlacesUseCase } from "./SearchPlacesUseCase";


export class GooglePlaceUseCases {

    getPlaceDetails: GetPlaceDetailsUseCase;
    getPlaceDetailsByCoords: GetPlaceDetailsByCoordsUseCase;
    getDirections: GetDirectionsUseCase;
    searchPlaces: SearchPlacesUseCase;

    constructor( 
        {
            getPlaceDetailsUseCase,
            getPlaceDetailsByCoordsUseCase,
            getDirectionsUseCase,
            searchPlacesUseCase
        }: 
        {
            getPlaceDetailsUseCase: GetPlaceDetailsUseCase,
            getPlaceDetailsByCoordsUseCase: GetPlaceDetailsByCoordsUseCase,
            getDirectionsUseCase: GetDirectionsUseCase,
            searchPlacesUseCase: SearchPlacesUseCase
        }
    ) {
        this.getPlaceDetails = getPlaceDetailsUseCase; 
        this.getPlaceDetailsByCoords = getPlaceDetailsByCoordsUseCase;
        this.getDirections = getDirectionsUseCase;
        this.searchPlaces = searchPlacesUseCase;
    }
}