import { VehicleType } from "./ClientRequest";

export interface DriverCarInfo{
    id_driver: number;
    brand: string;
    plate: string;
    color: string;
    // Solo llegan al consultar el vehículo propio o el de un conductor que ofertó (sin documentos)
    vehicle_type?: VehicleType;
    model_year?: number | null;
    is_covered?: boolean;
    license_category?: string | null;
    // Capacidad real si es más grande que el típico de su tipo; null = la típica
    capacity_kg?: number | null;
    capacity_m3?: number | null;
    // Solo los ve el dueño
    license_expires_at?: string | null;
    soat_expires_at?: string | null;
    techno_expires_at?: string | null;
}

// Cambiar de vehículo o corregir sus datos (PUT /driver-car-info/me)
export interface DriverVehicleUpdate {
    vehicle_type: VehicleType;
    brand: string;
    color: string;
    plate: string;
    model_year: number;
    is_covered: boolean;
    capacity_kg: number | null;
    capacity_m3: number | null;
}

// Renovar documentos (PUT /driver-car-info/me/documents); fechas en ISO
export interface DriverDocumentsUpdate {
    license_category: string;
    license_expires_at: string;
    soat_expires_at: string;
    techno_expires_at: string | null;
}
