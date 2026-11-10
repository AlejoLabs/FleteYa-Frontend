import { VehicleType } from "./ClientRequest";
import { Country } from "./Country";

export interface TimeAndDistanceValues {
    distance:            Distance;
    duration:            Distance;
    origin_address:      string;
    destination_address: string;
    recommended_value:   number;
    vehicle_type?:       VehicleType;
    // Parte del valor que se queda FleteYa (0.1 = 10 %)
    commission_rate?:    number;
    // País de la recogida, con su moneda y sus reglas para el precio (paso, límites, decimales)
    country?:            Country;
}

export interface Distance {
    text:  string;
    value: number;
}

export interface Duration {
    text:  string;
    value: number;
}
