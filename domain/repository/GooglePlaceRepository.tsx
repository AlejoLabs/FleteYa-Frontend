import { LatLng } from "react-native-maps";
import { GoogleDirections } from "../models/GoogleDirections";
import { PlaceDetail } from "../models/PlaceDetail";
import { PlaceGeocodeDetail } from "../models/PlaceGeocodeDetail";
import { PlaceAutocomplete } from "../models/PlacePrediction";

export interface GooglePlaceRepository {
    
    getPlaceDetails(placeId: string): Promise<PlaceDetail | null>;
    getPlaceDetailsByCoords(lat: number, lng: number): Promise<PlaceGeocodeDetail | null>;
    getDirections(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null>;
    // country: código ISO del país donde buscar (CO, FR...); sin él, en todo el mundo
    searchPlaces(input: string, country?: string | null): Promise<PlaceAutocomplete | null>;
}