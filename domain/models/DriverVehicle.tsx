import { VehicleType } from "./ClientRequest";

// Vehículo y documentos que el conductor registra al crear su cuenta (POST /auth/register-driver)
export interface DriverVehicle {
    vehicle_type: VehicleType;
    brand: string;
    color: string;
    plate: string;
    model_year: number;
    is_covered: boolean;
    license_number: string;
    license_category: string;
    // Fechas ISO
    license_expires_at: string;
    soat_expires_at: string;
    techno_expires_at?: string;
    property_card_number: string;
}
