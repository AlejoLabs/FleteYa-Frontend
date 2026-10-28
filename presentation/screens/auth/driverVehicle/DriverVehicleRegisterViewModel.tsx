import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { User } from "../../../../domain/models/User";
import { VehicleType } from "../../../../domain/models/ClientRequest";
import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";
import { PhotoUseCases } from "../../../../domain/useCases/photo/PhotoUseCases";
import { parseDayMonthYear } from "../../../utils/Formatters";

export const LICENSE_CATEGORIES = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
// Igual que el backend: B1/C1 sirven hasta furgón liviano (tipo NHR); el camión pide B2/C2 o superior
export const HEAVY_CATEGORIES = ['B2', 'B3', 'C2', 'C3'];
const PLATE_REGEX = /^[A-Z]{3}\d{3}$/;
export const MAX_VEHICLE_PHOTOS = 4;

// Lo que la persona escribe en el formulario, tal cual, antes de validar
export interface DriverVehicleForm {
    vehicleType: VehicleType | null;
    brand: string;
    color: string;
    plate: string;
    modelYear: string;
    isCovered: boolean;
    licenseNumber: string;
    licenseCategory: string | null;
    licenseExpires: string;
    soatExpires: string;
    technoExpires: string;
    propertyCard: string;
    // Fotos ya comprimidas en el teléfono; se suben con el token que devuelve el registro
    photos: string[];
}

export const EMPTY_DRIVER_VEHICLE_FORM: DriverVehicleForm = {
    vehicleType: null,
    brand: '',
    color: '',
    plate: '',
    modelYear: '',
    isCovered: false,
    licenseNumber: '',
    licenseCategory: null,
    licenseExpires: '',
    soatExpires: '',
    technoExpires: '',
    propertyCard: '',
    photos: [],
};

export const isHeavyVehicle = (vehicleType: VehicleType | null) => vehicleType === 'CAMION';

const normalizePlate = (plate: string) => plate.toUpperCase().replace(/[\s-]/g, '');

export class DriverVehicleRegisterViewModel {

    private authUseCases: AuthUseCases;
    private photoUseCases: PhotoUseCases;

    constructor({ authUseCases, photoUseCases }: { authUseCases: AuthUseCases, photoUseCases: PhotoUseCases }) {
        this.authUseCases = authUseCases;
        this.photoUseCases = photoUseCases;
    }

    // Todos los problemas a la vez, para que la persona los corrija de una
    validate(form: DriverVehicleForm): string[] {
        const isHeavy = isHeavyVehicle(form.vehicleType);
        return [
            !form.vehicleType && 'Elige el tipo de vehículo',
            (form.brand.trim().length < 2 || form.color.trim().length < 2) && 'Escribe la marca y el color',
            !PLATE_REGEX.test(normalizePlate(form.plate)) && 'La placa debe tener 3 letras y 3 números, por ejemplo ABC123',
            !/^\d{4}$/.test(form.modelYear.trim()) && 'Escribe el año del modelo, por ejemplo 2019',
            form.licenseNumber.trim().length < 5 && 'Escribe el número de tu licencia',
            !form.licenseCategory && 'Elige la categoría de tu licencia',
            form.licenseCategory && isHeavy && !HEAVY_CATEGORIES.includes(form.licenseCategory) && 'Para camión necesitas licencia B2 o C2 en adelante',
            !parseDayMonthYear(form.licenseExpires) && 'La fecha de vencimiento de la licencia debe ser DD/MM/AAAA',
            !parseDayMonthYear(form.soatExpires) && 'La fecha de vencimiento del SOAT debe ser DD/MM/AAAA',
            form.technoExpires.trim() !== '' && !parseDayMonthYear(form.technoExpires) && 'La fecha de la revisión técnico-mecánica debe ser DD/MM/AAAA',
            form.propertyCard.trim().length < 5 && 'Escribe el número de la tarjeta de propiedad',
            form.photos.length === 0 && 'Agrega al menos una foto del vehículo',
        ].filter(Boolean) as string[];
    }

    // Llamar solo después de validate() sin problemas
    async registerDriver(account: User, form: DriverVehicleForm): Promise<AuthResponse | ErrorResponse> {
        const response = await this.authUseCases.registerDriver.execute(account, {
            vehicle_type: form.vehicleType!,
            brand: form.brand.trim(),
            color: form.color.trim(),
            plate: normalizePlate(form.plate),
            model_year: Number(form.modelYear),
            is_covered: form.isCovered,
            license_number: form.licenseNumber.trim(),
            license_category: form.licenseCategory!,
            license_expires_at: parseDayMonthYear(form.licenseExpires)!,
            soat_expires_at: parseDayMonthYear(form.soatExpires)!,
            techno_expires_at: form.technoExpires.trim() ? parseDayMonthYear(form.technoExpires)! : undefined,
            property_card_number: form.propertyCard.trim(),
        });
        if ('token' in response) {
            // La cuenta ya existe: si una foto falla, puede volver a subirla desde "Mi vehículo"
            for (const uri of form.photos) {
                await this.photoUseCases.uploadVehiclePhoto.execute(uri, response.token);
            }
        }
        return response;
    }
}
