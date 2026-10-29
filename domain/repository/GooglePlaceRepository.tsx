import { LatLng } from "react-native-maps";
import { GoogleDirections } from "../models/GoogleDirections";
import { PlaceDetail } from "../models/PlaceDetail";
import { PlaceGeocodeDetail } from "../models/PlaceGeocodeDetail";
import { PlaceAutocomplete } from "../models/PlacePrediction";

export interface GooglePlaceRepository {
    
    getPlaceDetails(placeId: string): Promise<PlaceDetail | null>;
    getPlaceDetailsByCoords(lat: number, lng: number): Promise<PlaceGeocodeDetail | null>;
    getDirections(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null>;
    searchPlaces(input: string): Promise<PlaceAutocomplete | null>;
}