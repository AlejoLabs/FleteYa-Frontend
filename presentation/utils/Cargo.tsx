import { CargoCategory, VehicleType } from "../../domain/models/ClientRequest";
import { t, tk } from '../../i18n';

// Misma tabla que el backend (src/utils/vehicles.ts): de menor a mayor capacidad
export const VEHICLES: { type: VehicleType; label: string; maxWeightKg: number; maxVolumeM3: number; maxLengthCm: number }[] = [
    { type: 'CARRY',   label: 'Carry',                maxWeightKg: 700,   maxVolumeM3: 3,  maxLengthCm: 200 },
    { type: 'ESTACAS', label: tk('cargo.camionetaDeEstacas'), maxWeightKg: 2000,  maxVolumeM3: 12, maxLengthCm: 400 },
    { type: 'FURGON',  label: tk('cargo.furgon'),               maxWeightKg: 4500,  maxVolumeM3: 20, maxLengthCm: 500 },
    { type: 'CAMION',  label: tk('cargo.camion'),               maxWeightKg: 10000, maxVolumeM3: 45, maxLengthCm: 800 },
];

// Lo máximo que el conductor puede declarar si su vehículo es más grande que el típico (igual que el backend)
export const CAPACITY_LIMITS: Record<VehicleType, { maxWeightKg: number; maxVolumeM3: number }> = {
    CARRY:   { maxWeightKg: 1500,  maxVolumeM3: 6 },
    ESTACAS: { maxWeightKg: 4500,  maxVolumeM3: 25 },
    FURGON:  { maxWeightKg: 9000,  maxVolumeM3: 45 },
    CAMION:  { maxWeightKg: 20000, maxVolumeM3: 90 },
};

export const vehicleLabel = (type?: string | null) => t(VEHICLES.find((v) => v.type === type)?.label ?? tk('cargo.vehiculoDeCarga'));
export const vehicleRank = (type: VehicleType) => VEHICLES.findIndex((v) => v.type === type);

// Las medidas son las del artículo más grande; el volumen total se estima multiplicándolo por los artículos.
// Devuelve null si la carga no cabe ni en un camión
export const suggestVehicle = (weightKg: number, lengthCm: number, widthCm: number, heightCm: number, packages: number): VehicleType | null => {
    const longest = Math.max(lengthCm, widthCm, heightCm);
    const volume = (lengthCm * widthCm * heightCm / 1_000_000) * Math.max(packages, 1);
    return VEHICLES.find((v) => weightKg <= v.maxWeightKg && volume <= v.maxVolumeM3 && longest <= v.maxLengthCm)?.type ?? null;
}

export const CARGO_CATEGORIES: { value: CargoCategory; label: string }[] = [
    { value: 'MUDANZA', label: tk('cargo.mudanza') },
    { value: 'MERCANCIA', label: tk('cargo.mercancia') },
    { value: 'MATERIALES', label: tk('cargo.materialesDeConstruccion') },
    { value: 'MAQUINARIA', label: tk('cargo.maquinaria') },
    { value: 'ELECTRODOMESTICOS', label: tk('cargo.electrodomesticos') },
    { value: 'OTRO', label: tk('cargo.otro') },
];

export const cargoCategoryLabel = (value?: string | null) => t(CARGO_CATEGORIES.find((c) => c.value === value)?.label ?? tk('cargo.carga'));

export const CLIENT_CANCEL_REASONS = [
    tk('cargo.yaNoNecesitoElFlete'),
    tk('cargo.cambieLaFechaOLa'),
    tk('cargo.elConductorTardaMucho'),
    tk('cargo.encontreOtroTransporte'),
];

export const DRIVER_CANCEL_REASONS = [
    tk('cargo.laCargaNoCabeEn'),
    tk('cargo.elClienteNoResponde'),
    tk('cargo.tuveUnProblemaConEl'),
    tk('cargo.laDireccionNoEsCorrecta'),
];

export const DRIVER_STATUS_LABELS: Record<string, string> = {
    CREATED: tk('cargo.buscandoConductor'),
    ACCEPTED: tk('cargo.conductorAsignado'),
    ON_THE_WAY: tk('cargo.conductorEnCamino'),
    ARRIVED: tk('cargo.conductorEnElOrigen'),
    TRAVELING: tk('cargo.cargaRecogidaEnCaminoAl'),
    FINISHED: tk('common.entregado'),
    CANCELED: tk('cargo.cancelado'),
    EXPIRED: tk('cargo.busquedaVencida'),
};

// Texto corto del cargue y descargue, por ejemplo "Piso 3 sin ascensor"
export const floorText = (floor?: number | null, hasElevator?: boolean | null) => {
    if (floor === null || floor === undefined) return null;
    if (floor <= 1) return floor === 1 ? t('cargo.primerPiso') : t('cargo.piso', { floor });
    if (hasElevator === null || hasElevator === undefined) return t('cargo.piso', { floor });
    return hasElevator ? t('cargo.pisoConAscensor', { floor }) : t('cargo.pisoSinAscensor', { floor });
}
