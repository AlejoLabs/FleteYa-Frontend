import { PlaceDetail } from "../../../../domain/models/PlaceDetail";
import { GoogleApiRequestHandler } from "../api/ApiRequestHandler";

export class GooglePlaceServices {
    async getPlaceDetails(placeId: string): Promise<PlaceDetail | null> {
        try {
            const response = await GoogleApiRequestHandler.post<PlaceDetail>(`/place/details/json?place_id=${placeId}&key=AIzaSyCo2zaq4NDH9Yb5q2GzTSy5rE09Vejs0WI`);
            return response.data;
        } catch (error) {
            console.error("Error en la peticion", error);
            return null;
        }
    }
}