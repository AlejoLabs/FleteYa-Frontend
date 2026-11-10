import { LatLng } from "react-native-maps";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";
import { PlaceDetail } from "../../../../domain/models/PlaceDetail";
import { PlaceGeocodeDetail } from "../../../../domain/models/PlaceGeocodeDetail";
import { PlaceAutocomplete } from "../../../../domain/models/PlacePrediction";
import { GoogleApiRequestHandler } from "../api/ApiRequestHandler";
import { GoogleMapsApiKey } from "../api/GoogleMapsApiKey";
import { currentLanguage } from "../../../../i18n";
import { LanguageCode } from "../../../../i18n/languages";

// Idioma de los textos de Google según el de la app. En las rutas, el español es el de Latinoamérica ("15 min")
const PLACES_LANGUAGE: Record<LanguageCode, string> = { es: 'es', en: 'en', fr: 'fr', it: 'it', pt: 'pt-BR', de: 'de' };
const DIRECTIONS_LANGUAGE: Record<LanguageCode, string> = { ...PLACES_LANGUAGE, es: 'es-419' };

export class GooglePlaceServices {
    // Direcciones del país donde está el cliente (el que el backend calculó para la recogida), en el idioma de la app.
    // Sin país (todavía no se sabe o FleteYa no opera ahí) se busca en todo el mundo
    async searchPlaces(input: string, country?: string | null): Promise<PlaceAutocomplete | null> {
        try {
            const components = country ? `&components=country:${country.toLowerCase()}` : ''; // i18n-ignore: parámetro de la URL de Google
            const response = await GoogleApiRequestHandler.get<PlaceAutocomplete>(`/place/autocomplete/json?input=${encodeURIComponent(input)}&language=${PLACES_LANGUAGE[currentLanguage()]}${components}&key=${GoogleMapsApiKey}`);
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
            const response = await GoogleApiRequestHandler.get<GoogleDirections>(`/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&language=${DIRECTIONS_LANGUAGE[currentLanguage()]}&key=${GoogleMapsApiKey}`);
            return response.data;
        } catch (error) {
            console.error("Error en la peticion", error);
            return null;
        }
    }
}