import { VehicleType } from "./ClientRequest";

export interface TimeAndDistanceValues {
    distance:            Distance;
    duration:            Distance;
    origin_address:      string;
    destination_address: string;
    recommended_value:   number;
    vehicle_type?:       VehicleType;
    // Parte del valor que se queda FleteYa (0.1 = 10 %)
    commission_rate?:    number;
}

export interface Distance {
    text:  string;
    value: number;
}

export interface Duration {
    text:  string;
    value: number;
}
