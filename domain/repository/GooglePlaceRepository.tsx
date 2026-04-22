import { PlaceDetail } from "../models/PlaceDetail";

export interface GooglePlaceRepository {
    
    getPlaceDetails(placeId: string): Promise<PlaceDetail | null>;
}