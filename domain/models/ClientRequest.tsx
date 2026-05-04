export interface ClientRequest {

    id?: number;
    id_client: number;
    fare_offered: number;
    pickup_lat: number;
    pickup_lng: number;
    destination_lat: number;
    destination_lng: number;
    destination_description: string;
    pickup_description: string;
}