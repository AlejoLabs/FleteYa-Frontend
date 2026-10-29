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
}
