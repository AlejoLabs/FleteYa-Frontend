export interface ClientRequestResponse {
    id:                      number;
    id_client:               number;
    fare_offered:            number;
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
}

export interface Client {
    name:     string;
    image:    string;
    phone:    string;
    lastname: string;
}

export interface Driver {
    name:     string;
    image:    string;
    phone:    string;
    lastname: string;
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