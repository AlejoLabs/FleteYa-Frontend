import { CargoCategory, VehicleType } from "../../domain/models/ClientRequest";

// Misma tabla que el backend (src/utils/vehicles.ts): de menor a mayor capacidad
export const VEHICLES: { type: VehicleType; label: string; maxWeightKg: number; maxVolumeM3: number; maxLengthCm: number }[] = [
    { type: 'CARRY',   label: 'Carry',                maxWeightKg: 700,   maxVolumeM3: 3,  maxLengthCm: 200 },
    { type: 'ESTACAS', label: 'Camioneta de estacas', maxWeightKg: 2000,  maxVolumeM3: 12, maxLengthCm: 400 },
    { type: 'FURGON',  label: 'Furgón',               maxWeightKg: 4500,  maxVolumeM3: 20, maxLengthCm: 500 },
    { type: 'CAMION',  label: 'Camión',               maxWeightKg: 10000, maxVolumeM3: 45, maxLengthCm: 800 },
];

export const vehicleLabel = (type?: string | null) => VEHICLES.find((v) => v.type === type)?.label ?? 'Vehículo de carga';
export const vehicleRank = (type: VehicleType) => VEHICLES.findIndex((v) => v.type === type);

// Las medidas son las del artículo más grande; el volumen total se estima multiplicándolo por los artículos.
// Devuelve null si la carga no cabe ni en un camión
export const suggestVehicle = (weightKg: number, lengthCm: number, widthCm: number, heightCm: number, packages: number): VehicleType | null => {
    const longest = Math.max(lengthCm, widthCm, heightCm);
    const volume = (lengthCm * widthCm * heightCm / 1_000_000) * Math.max(packages, 1);
    return VEHICLES.find((v) => weightKg <= v.maxWeightKg && volume <= v.maxVolumeM3 && longest <= v.maxLengthCm)?.type ?? null;
}

export const CARGO_CATEGORIES: { value: CargoCategory; label: string }[] = [
    { value: 'MUDANZA', label: 'Mudanza' },
    { value: 'MERCANCIA', label: 'Mercancía' },
    { value: 'MATERIALES', label: 'Materiales de construcción' },
    { value: 'MAQUINARIA', label: 'Maquinaria' },
    { value: 'ELECTRODOMESTICOS', label: 'Electrodomésticos' },
    { value: 'OTRO', label: 'Otro' },
];

export const cargoCategoryLabel = (value?: string | null) => CARGO_CATEGORIES.find((c) => c.value === value)?.label ?? 'Carga';

export const CLIENT_CANCEL_REASONS = [
    'Ya no necesito el flete',
    'Cambié la fecha o la hora',
    'El conductor tarda mucho',
    'Encontré otro transporte',
];

export const DRIVER_CANCEL_REASONS = [
    'La carga no cabe en mi vehículo',
    'El cliente no responde',
    'Tuve un problema con el vehículo',
    'La dirección no es correcta',
];

export const DRIVER_STATUS_LABELS: Record<string, string> = {
    CREATED: 'Buscando conductor',
    ACCEPTED: 'Conductor asignado',
    ON_THE_WAY: 'Conductor en camino',
    ARRIVED: 'Conductor en el origen',
    TRAVELING: 'Carga recogida, en camino al destino',
    FINISHED: 'Entregado',
    CANCELED: 'Cancelado',
    EXPIRED: 'Búsqueda vencida',
};

// Texto corto del cargue y descargue, por ejemplo "Piso 3 sin ascensor"
export const floorText = (floor?: number | null, hasElevator?: boolean | null) => {
    if (floor === null || floor === undefined) return null;
    if (floor <= 1) return floor === 1 ? 'Primer piso' : `Piso ${floor}`;
    if (hasElevator === null || hasElevator === undefined) return `Piso ${floor}`;
    return `Piso ${floor} ${hasElevator ? 'con' : 'sin'} ascensor`;
}
