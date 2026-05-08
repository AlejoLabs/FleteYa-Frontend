export interface DriverTripOffer {
    id?: number;
    id_driver: number;
    id_client_request: number;
    fare_offered: number;
    time: number;
    distance: number;
    driver?: Driver;
}

export interface Driver {
    name: string;
    lastname: string;
    image: string;
    phone: string;
}