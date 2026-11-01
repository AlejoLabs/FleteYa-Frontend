import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { VehicleType } from "../../../../domain/models/ClientRequest";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";
import { PhotoUseCases } from "../../../../domain/useCases/photo/PhotoUseCases";
import { CAPACITY_LIMITS, VEHICLES, vehicleLabel } from "../../../utils/Cargo";
import { formatDayMonthYear, parseDayMonthYear } from "../../../utils/Formatters";
import { HEAVY_CATEGORIES } from "../../auth/driverVehicle/DriverVehicleRegisterViewModel";

// Cambiar de vehículo o corregir sus datos. Con biggerThanUsual el conductor declara su capacidad real
export interface VehicleForm {
    vehicleType: VehicleType;
    brand: string;
    color: string;
    plate: string;
    modelYear: string;
    isCovered: boolean;
    biggerThanUsual: boolean;
    capacityKg: string;
    capacityM3: string;
}

export type VehicleFormErrors = Partial<Record<keyof VehicleForm, string>>;

// Renovar documentos: fechas como DD/MM/AAAA
export interface DocumentsForm {
    licenseCategory: string;
    licenseExpires: string;
    soatExpires: string;
    technoExpires: string;
}

export type DocumentsFormErrors = Partial<Record<keyof DocumentsForm, string>>;

const PLATE_REGEX = /^[A-Z]{3}\d{3}$/;
const normalizePlate = (plate: string) => plate.toUpperCase().replace(/[\s-]/g, '');
const toNumber = (value: string) => Number(value.replace(',', '.'));

// Una fecha válida y que no haya pasado
const futureDateError = (value: string) => {
    const iso = parseDayMonthYear(value);
    if (!iso) return 'Escríbela como DD/MM/AAAA';
    if (new Date(iso).getTime() < Date.now()) return 'Esa fecha ya pasó: escribe la del documento renovado';
    return null;
}

// Mi vehículo: los datos, las fotos que ven los clientes y el estado de los documentos
export class DriverCarInfoViewModel {
    private driverCarInfoUseCases: DriverCarInfoUseCases;
    private photoUseCases: PhotoUseCases;

    constructor(
        {
            driverCarInfoUseCases,
            photoUseCases
        }:
        {
            driverCarInfoUseCases: DriverCarInfoUseCases,
            photoUseCases: PhotoUseCases
        }
    ){
        this.driverCarInfoUseCases = driverCarInfoUseCases;
        this.photoUseCases = photoUseCases;
    }

    async getMyDocuments() {
        return await this.driverCarInfoUseCases.getMyDocuments.execute();
    }

    async getVehiclePhotos(idDriver: number) {
        return await this.photoUseCases.getVehiclePhotos.execute(idDriver);
    }

    async uploadVehiclePhoto(uri: string) {
        return await this.photoUseCases.uploadVehiclePhoto.execute(uri);
    }

    async deleteVehiclePhoto(idPhoto: number) {
        return await this.photoUseCases.deleteVehiclePhoto.execute(idPhoto);
    }

    async getDriverCarInfo(idDriver: number){
        return await this.driverCarInfoUseCases.getDriverCarInfo.execute(idDriver);
    }

    // El formulario arranca con lo que ya está guardado
    vehicleFormFrom(car: DriverCarInfo): VehicleForm {
        return {
            vehicleType: car.vehicle_type ?? 'ESTACAS',
            brand: car.brand,
            color: car.color,
            plate: car.plate,
            modelYear: car.model_year ? String(car.model_year) : '',
            isCovered: car.is_covered ?? false,
            biggerThanUsual: car.capacity_kg != null || car.capacity_m3 != null,
            capacityKg: car.capacity_kg != null ? String(car.capacity_kg) : '',
            capacityM3: car.capacity_m3 != null ? String(car.capacity_m3) : '',
        };
    }

    documentsFormFrom(car: DriverCarInfo): DocumentsForm {
        return {
            licenseCategory: car.license_category ?? '',
            licenseExpires: formatDayMonthYear(car.license_expires_at),
            soatExpires: formatDayMonthYear(car.soat_expires_at),
            technoExpires: formatDayMonthYear(car.techno_expires_at),
        };
    }

    // Lo típico de cada tipo, para la ayuda del formulario
    typicalCapacityText(vehicleType: VehicleType) {
        const vehicle = VEHICLES.find((item) => item.type === vehicleType)!;
        return `Lo normal en ${vehicle.label.toLowerCase()} es hasta ${vehicle.maxWeightKg.toLocaleString('es-CO')} kg y ${vehicle.maxVolumeM3} m³.`;
    }

    validateVehicle(form: VehicleForm, licenseCategory?: string | null): VehicleFormErrors {
        const errors: VehicleFormErrors = {};
        const limits = CAPACITY_LIMITS[form.vehicleType];
        if (form.vehicleType === 'CAMION' && !HEAVY_CATEGORIES.includes(licenseCategory ?? '')) {
            errors.vehicleType = 'Para camión necesitas licencia B2 o C2: actualiza primero tus documentos';
        }
        if (form.brand.trim().length < 2) errors.brand = 'Escribe la marca y la referencia';
        if (form.color.trim().length < 2) errors.color = 'Escribe el color';
        if (!PLATE_REGEX.test(normalizePlate(form.plate))) errors.plate = '3 letras y 3 números, por ejemplo ABC123';
        const year = Number(form.modelYear);
        if (!/^\d{4}$/.test(form.modelYear.trim()) || year < 1980 || year > new Date().getFullYear() + 1) errors.modelYear = 'Por ejemplo 2019';
        if (form.biggerThanUsual) {
            const kg = toNumber(form.capacityKg);
            const m3 = toNumber(form.capacityM3);
            if (!(kg > 0)) errors.capacityKg = 'Escribe cuántos kilos carga';
            else if (kg > limits.maxWeightKg) errors.capacityKg = `Máximo ${limits.maxWeightKg.toLocaleString('es-CO')} kg para este tipo`;
            if (!(m3 > 0)) errors.capacityM3 = 'Escribe cuántos metros cúbicos le caben';
            else if (m3 > limits.maxVolumeM3) errors.capacityM3 = `Máximo ${limits.maxVolumeM3} m³ para este tipo`;
        }
        return errors;
    }

    // Llamar solo después de validateVehicle() sin errores
    async saveVehicle(form: VehicleForm) {
        return await this.driverCarInfoUseCases.updateMyVehicle.execute({
            vehicle_type: form.vehicleType,
            brand: form.brand.trim(),
            color: form.color.trim(),
            plate: normalizePlate(form.plate),
            model_year: Number(form.modelYear),
            is_covered: form.isCovered,
            capacity_kg: form.biggerThanUsual ? Math.round(toNumber(form.capacityKg)) : null,
            capacity_m3: form.biggerThanUsual ? toNumber(form.capacityM3) : null,
        });
    }

    validateDocuments(form: DocumentsForm, vehicleType?: VehicleType): DocumentsFormErrors {
        const errors: DocumentsFormErrors = {};
        if (!form.licenseCategory) errors.licenseCategory = 'Elige la categoría de tu licencia';
        else if (vehicleType === 'CAMION' && !HEAVY_CATEGORIES.includes(form.licenseCategory)) errors.licenseCategory = 'Para camión necesitas licencia B2 o C2 en adelante';
        const license = futureDateError(form.licenseExpires);
        if (license) errors.licenseExpires = license;
        const soat = futureDateError(form.soatExpires);
        if (soat) errors.soatExpires = soat;
        if (form.technoExpires.trim() !== '') {
            const techno = futureDateError(form.technoExpires);
            if (techno) errors.technoExpires = techno;
        }
        return errors;
    }

    // Llamar solo después de validateDocuments() sin errores
    async saveDocuments(form: DocumentsForm) {
        return await this.driverCarInfoUseCases.updateMyDocuments.execute({
            license_category: form.licenseCategory,
            license_expires_at: parseDayMonthYear(form.licenseExpires)!,
            soat_expires_at: parseDayMonthYear(form.soatExpires)!,
            techno_expires_at: form.technoExpires.trim() ? parseDayMonthYear(form.technoExpires)! : null,
        });
    }

    // "Furgón · Chevrolet NHR 2021"
    vehicleTitle(car: DriverCarInfo) {
        return [vehicleLabel(car.vehicle_type), [car.brand, car.model_year].filter(Boolean).join(' ')].join(' · ');
    }

    // Lo que puede llevar: la capacidad que declaró o, si no declaró, la típica de su tipo. Es lo que usa la app
    // para mostrarle solo cargas que caben
    capacityText(car: DriverCarInfo) {
        const vehicle = VEHICLES.find((item) => item.type === car.vehicle_type);
        if (!vehicle) return null;
        const kg = car.capacity_kg ?? vehicle.maxWeightKg;
        const m3 = car.capacity_m3 ?? vehicle.maxVolumeM3;
        return `Hasta ${kg.toLocaleString('es-CO')} kg y ${String(m3).replace('.', ',')} m³`;
    }

    // "VES 129", como se lee en la placa
    plateText(plate: string) {
        const clean = normalizePlate(plate);
        return clean.length === 6 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean;
    }
}
