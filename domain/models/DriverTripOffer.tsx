import { Rating } from "./Rating";

export interface DriverTripOffer {
    id?: number;
    id_driver: number;
    id_client_request: number;
    fare_offered: number;
    time: number;
    distance: number;
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED';
    driver?: Driver;
    car?: { brand: string; color: string; plate: string; vehicle_type?: string };
    cargo_description?: string;
    weight_kg?: number;
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;
}

export interface Driver {
    name: string;
    lastname: string;
    image: string;
    rating?: Rating;
}