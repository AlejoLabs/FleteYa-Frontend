import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";
import { PhotoUseCases } from "../../../../domain/useCases/photo/PhotoUseCases";
import { VEHICLES, vehicleLabel } from "../../../utils/Cargo";

export interface CarForm {
    brand: string;
    color: string;
    plate: string;
}

export type CarFormErrors = Partial<Record<keyof CarForm, string>>;

const PLATE_REGEX = /^[A-Z]{3}\d{3}$/;
const normalizePlate = (plate: string) => plate.toUpperCase().replace(/[\s-]/g, '');

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

    async createDriverCarInfo(driverCarInfo: DriverCarInfo){
        return await this.driverCarInfoUseCases.create.execute(driverCarInfo);
    }

    async getDriverCarInfo(idDriver: number){
        return await this.driverCarInfoUseCases.getDriverCarInfo.execute(idDriver);
    }

    validate(form: CarForm): CarFormErrors {
        const errors: CarFormErrors = {};
        if (form.brand.trim().length < 2) errors.brand = 'Escribe la marca y la referencia';
        if (form.color.trim().length < 2) errors.color = 'Escribe el color';
        if (!PLATE_REGEX.test(normalizePlate(form.plate))) errors.plate = '3 letras y 3 números, por ejemplo ABC123';
        return errors;
    }

    // Llamar solo después de validate() sin errores
    async saveCar(idDriver: number, form: CarForm) {
        return await this.createDriverCarInfo({
            id_driver: idDriver,
            brand: form.brand.trim(),
            color: form.color.trim(),
            plate: normalizePlate(form.plate),
        });
    }

    // "Furgón · Chevrolet NHR 2021"
    vehicleTitle(car: DriverCarInfo) {
        return [vehicleLabel(car.vehicle_type), [car.brand, car.model_year].filter(Boolean).join(' ')].join(' · ');
    }

    // Lo que puede llevar según el tipo de vehículo: es lo mismo que usa la app para mostrarle solo cargas que caben
    capacityText(car: DriverCarInfo) {
        const vehicle = VEHICLES.find((item) => item.type === car.vehicle_type);
        if (!vehicle) return null;
        return `Hasta ${vehicle.maxWeightKg.toLocaleString('es-CO')} kg y ${vehicle.maxVolumeM3} m³`;
    }

    // "VES 129", como se lee en la placa
    plateText(plate: string) {
        const clean = normalizePlate(plate);
        return clean.length === 6 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean;
    }
}
