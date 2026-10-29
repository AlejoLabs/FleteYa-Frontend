import { CargoCategory, VehicleType } from "./ClientRequest";
import { Rating } from "./Rating";

export interface ClientRequestResponse {
    id:                      number;
    id_client:               number;
    fare_offered:            number;
    fare_assigned?:          number | null;
    pickup_description:      string;
    destination_description: string;
    status:                  string;
    update_at:               Date;
    pickup_position:         Position;
    destination_position:    Position;
    distance:                number;
    time_difference:         number;
    client:                  Client;
    driver:                  Driver;
    google_distance_matrix:  GoogleDistanceMatrix;
    cargo_description?:      string;
    weight_kg?:              number;
    length_cm?:              number;
    width_cm?:               number;
    height_cm?:              number;
    id_driver_assigned?:     number | null;
    cargo_category?:         CargoCategory;
    packages?:               number;
    is_fragile?:             boolean;
    needs_cover?:            boolean;
    required_vehicle?:       VehicleType;
    helpers?:                number;
    pickup_floor?:           number | null;
    pickup_has_elevator?:    boolean | null;
    destination_floor?:      number | null;
    destination_has_elevator?: boolean | null;
    sender_name?:            string | null;
    sender_phone?:           string | null;
    receiver_name?:          string | null;
    receiver_phone?:         string | null;
    scheduled_at?:           string | null;
    expires_at?:             string | null;
    cancel_reason?:          string | null;
    // Precio de la oferta pendiente del conductor que consulta la lista, si ya ofertó
    my_offer?:               number | null;
    // Cuántas fotos de la carga subió el cliente (lista del conductor)
    cargo_photos?:           number;
    // Estrellas que dio cada uno al terminar (historial); el promedio del conductor sale de driver_rating
    driver_rating?:          number | null;
    client_rating?:          number | null;
    // Código de 4 dígitos para cerrar la entrega; solo llega cuando consulta el cliente
    delivery_code?:          string | null;
}

// Búsqueda o viaje en curso del usuario (GET /client-requests/me/active)
export interface ActiveTrip {
    id:                      number;
    id_client:               number;
    id_driver_assigned:      number | null;
    status:                  string;
    fare_offered:            number;
    fare_assigned:           number | null;
    pickup_description:      string;
    destination_description: string;
    cargo_category:          CargoCategory;
    cargo_description:       string | null;
    required_vehicle:        VehicleType;
    scheduled_at:            string | null;
    expires_at:              string | null;
    created_at:              string;
    role:                    'CLIENT' | 'DRIVER';
}

export interface Client {
    name:     string;
    image:    string;
    lastname: string;
    rating?:  Rating;
}

export interface Driver {
    name:     string;
    image:    string;
    lastname: string;
    rating?:  Rating;
}

export interface Position {
    x: number;
    y: number;
}

export interface GoogleDistanceMatrix {
    status:   string;
    distance: Distance;
    duration: Distance;
}

export interface Distance {
    text:  string;
    value: number;
}