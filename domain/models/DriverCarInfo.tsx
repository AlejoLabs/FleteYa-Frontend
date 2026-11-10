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
    // País del conductor (solo en su propio vehículo): decide el formato de la placa y el nombre de los documentos
    country_code?: string;
    // Capacidad real si es más grande que el típico de su tipo; null = la típica
    capacity_kg?: number | null;
    capacity_m3?: number | null;
    // Verificación del admin: los conductores nuevos esperan en PENDING
    approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    // Solo los ve el dueño: qué debe corregir si lo rechazaron, y por qué todavía no puede recibir fletes (null = puede)
    approval_note?: string | null;
    block_reason?: string | null;
    // El mismo motivo como código y datos: la app lo escribe en su idioma (block_reason viene en español)
    block_reason_detail?: { key: string; params?: Record<string, unknown> } | null;
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
