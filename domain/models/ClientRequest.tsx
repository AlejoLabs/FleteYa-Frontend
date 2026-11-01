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
    cargo_description?: string;
    weight_kg?: number;
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;
    cargo_category?: CargoCategory;
    packages?: number;
    is_fragile?: boolean;
    needs_cover?: boolean;
    vehicle_type?: VehicleType;
    no_prohibited_items?: boolean;
    helpers?: number;
    pickup_floor?: number;
    pickup_has_elevator?: boolean;
    destination_floor?: number;
    destination_has_elevator?: boolean;
    sender_name?: string;
    sender_phone?: string;
    receiver_name?: string;
    receiver_phone?: string;
    // ISO; sin fecha el flete es "Ahora"
    scheduled_at?: string;
    // Cómo paga al terminar el viaje; el conductor lo ve antes de ofertar
    payment_method?: PaymentMethod;
    // Valor aproximado de la carga, informativo
    declared_value?: number;
}

// CASH = efectivo al conductor; WOMPI = por la app (Nequi, tarjeta o PSE)
export type PaymentMethod = 'CASH' | 'WOMPI';

export type CargoCategory = 'MUDANZA' | 'MERCANCIA' | 'MATERIALES' | 'MAQUINARIA' | 'ELECTRODOMESTICOS' | 'OTRO';
export type VehicleType = 'CARRY' | 'ESTACAS' | 'FURGON' | 'CAMION';