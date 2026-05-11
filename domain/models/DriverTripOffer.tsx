export interface DriverTripOffer {
    id?: number;
    id_driver: number;
    id_client_request: number;
    fare_offered: number;
    time: number;
    distance: number;
    driver?: Driver;
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
    phone: string;
}