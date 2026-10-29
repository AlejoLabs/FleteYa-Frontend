import { LatLng } from "react-native-maps";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { PlaceDetail } from "../../../../domain/models/PlaceDetail";
import { PlaceGeocodeDetail } from "../../../../domain/models/PlaceGeocodeDetail";
import { PlaceAutocomplete } from "../../../../domain/models/PlacePrediction";
import { GoogleApiRequestHandler } from "../api/ApiRequestHandler";
import { GoogleMapsApiKey } from "../api/GoogleMapsApiKey";

export class GooglePlaceServices {
    // Solo direcciones de Colombia, que es donde opera FleteYa
    async searchPlaces(input: string): Promise<PlaceAutocomplete | null> {
        try {
            const response = await GoogleApiRequestHandler.get<PlaceAutocomplete>(`/place/autocomplete/json?input=${encodeURIComponent(input)}&language=es&components=country:co&key=${GoogleMapsApiKey}`);
            return response.data;
        } catch (error) {
            console.error("Error en la peticion", error);
            return null;
        }
    }

    async getPlaceDetails(placeId: string): Promise<PlaceDetail | null> {
        try {
            const response = await GoogleApiRequestHandler.get<PlaceDetail>(`/place/details/json?place_id=${placeId}&key=${GoogleMapsApiKey}`);
            return response.data;
        } catch (error) {
            console.error("Error en la peticion", error);
            return null;
        }
    }

    async getPlaceDetailByCoords(lat: number, lng: number): Promise<PlaceGeocodeDetail | null> {
        try {
            const response = await GoogleApiRequestHandler.get<PlaceGeocodeDetail>(`/geocode/json?latlng=${lat},${lng}&key=${GoogleMapsApiKey}`);
            return response.data;
        } catch (error) {
            console.error("Error en la peticion", error);
            return null;
        }  
    }

    async getDirections(origin: LatLng, destination: LatLng): Promise<GoogleDirections | null> {
        try {
            const response = await GoogleApiRequestHandler.get<GoogleDirections>(`/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GoogleMapsApiKey}`);
            return response.data;
        } catch (error) {
            console.error("Error en la peticion", error);
            return null;
        }
    }
}