import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { User } from "../../../../domain/models/User";
import { VehicleType } from "../../../../domain/models/ClientRequest";
import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";
import { PhotoUseCases } from "../../../../domain/useCases/photo/PhotoUseCases";
import { parseDayMonthYear } from "../../../utils/Formatters";
import { t } from '../../../../i18n';

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

export type DriverVehicleErrors = Partial<Record<keyof DriverVehicleForm, string>>;

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

    // Todos los problemas a la vez, cada uno debajo de su campo, para que la persona los corrija de una
    validate(form: DriverVehicleForm): DriverVehicleErrors {
        const isHeavy = isHeavyVehicle(form.vehicleType);
        const errors: DriverVehicleErrors = {};
        if (!form.vehicleType) errors.vehicleType = t('driverVehicleRegister.eligeElTipoDeVehiculo');
        if (form.brand.trim().length < 2) errors.brand = t('driverVehicleRegister.escribeLaMarcaYLa');
        if (form.color.trim().length < 2) errors.color = t('driverVehicleRegister.escribeElColor');
        if (!PLATE_REGEX.test(normalizePlate(form.plate))) errors.plate = t('driverVehicleRegister.t3LetrasY3Numeros');
        if (!/^\d{4}$/.test(form.modelYear.trim())) errors.modelYear = t('driverVehicleRegister.porEjemplo2019');
        if (form.licenseNumber.trim().length < 5) errors.licenseNumber = t('driverVehicleRegister.escribeElNumeroDeTu');
        if (!form.licenseCategory) errors.licenseCategory = t('driverVehicleRegister.eligeLaCategoriaDeTu');
        else if (isHeavy && !HEAVY_CATEGORIES.includes(form.licenseCategory)) errors.licenseCategory = t('driverVehicleRegister.paraCamionNecesitasLicenciaB2');
        if (!parseDayMonthYear(form.licenseExpires)) errors.licenseExpires = t('driverVehicleRegister.escribelaComoDdMmAaaa');
        if (!parseDayMonthYear(form.soatExpires)) errors.soatExpires = t('driverVehicleRegister.escribelaComoDdMmAaaa');
        if (form.technoExpires.trim() !== '' && !parseDayMonthYear(form.technoExpires)) errors.technoExpires = t('driverVehicleRegister.escribelaComoDdMmAaaa');
        if (form.propertyCard.trim().length < 5) errors.propertyCard = t('driverVehicleRegister.escribeElNumeroDeLa');
        if (form.photos.length === 0) errors.photos = t('driverVehicleRegister.agregaAlMenosUnaFoto');
        return errors;
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
