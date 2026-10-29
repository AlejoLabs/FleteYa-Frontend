import { CargoCategory, ClientRequest, VehicleType } from "../../../../domain/models/ClientRequest";
import { suggestVehicle, vehicleRank } from "../../../utils/Cargo";

// Solicitud que el cliente arma en cuatro pasos sobre el mapa, antes de publicarla
export interface PlacePoint {
    lat: number;
    lng: number;
    address: string;
}

export interface RequestDraft {
    origin: PlacePoint | null;
    destination: PlacePoint | null;
    // Paso 2: qué se mueve
    category: CargoCategory;
    description: string;
    weightKg: string;
    packages: number;
    helpers: number;
    // Paso 3: medidas del bulto más grande, cuidados y vehículo
    lengthCm: string;
    widthCm: string;
    heightCm: string;
    isFragile: boolean;
    needsCover: boolean;
    // Fotos ya comprimidas en el teléfono; se suben después de crear la solicitud
    photos: string[];
    // null = el sugerido por peso y medidas
    vehicleType: VehicleType | null;
    pickupFloor: number;
    pickupElevator: boolean;
    destinationFloor: number;
    destinationElevator: boolean;
    // Paso 4: cuándo, precio y contactos. scheduledAt null = "Ahora"
    scheduledAt: Date | null;
    fare: number;
    otherSender: boolean;
    senderName: string;
    senderPhone: string;
    otherReceiver: boolean;
    receiverName: string;
    receiverPhone: string;
    noProhibitedItems: boolean;
}

export const EMPTY_DRAFT: RequestDraft = {
    origin: null,
    destination: null,
    category: 'MUDANZA',
    description: '',
    weightKg: '',
    packages: 1,
    helpers: 0,
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    isFragile: false,
    needsCover: false,
    photos: [],
    vehicleType: null,
    pickupFloor: 1,
    pickupElevator: false,
    destinationFloor: 1,
    destinationElevator: false,
    scheduledAt: null,
    fare: 0,
    otherSender: false,
    senderName: '',
    senderPhone: '',
    otherReceiver: false,
    receiverName: '',
    receiverPhone: '',
    noProhibitedItems: false,
};

export const REQUEST_STEPS = ['Ruta', 'Carga', 'Medidas', 'Precio'];
export const MAX_CARGO_PHOTOS = 4;
// Los precios se redondean a cientos y se suben o bajan de a mil
export const FARE_STEP = 1000;

export type DraftField = keyof RequestDraft;
export type DraftErrors = Partial<Record<DraftField, string>>;

const PHONE_REGEX = /^3\d{9}$/;

const toNumber = (value: string) => Number(value.replace(',', '.'));
const isPositive = (value: string) => value.trim() !== '' && !isNaN(toNumber(value)) && toNumber(value) > 0;

export const hasSize = (draft: RequestDraft) =>
    isPositive(draft.weightKg) && isPositive(draft.lengthCm) && isPositive(draft.widthCm) && isPositive(draft.heightCm);

// Vehículo más pequeño donde cabe la carga; null si todavía no hay medidas o no cabe ni en un camión
export const suggestedVehicleFor = (draft: RequestDraft): VehicleType | null => hasSize(draft)
    ? suggestVehicle(toNumber(draft.weightKg), toNumber(draft.lengthCm), toNumber(draft.widthCm), toNumber(draft.heightCm), draft.packages)
    : null;

// Volumen del bulto más grande en m³, como lo pide el cálculo del precio
export const sizeM3 = (draft: RequestDraft) =>
    (toNumber(draft.lengthCm) / 100) * (toNumber(draft.widthCm) / 100) * (toNumber(draft.heightCm) / 100);

export const weightKg = (draft: RequestDraft) => toNumber(draft.weightKg);

// Errores del paso; vacío si se puede seguir
export const validateStep = (step: number, draft: RequestDraft): DraftErrors => {
    const errors: DraftErrors = {};
    if (step === 0) {
        if (!draft.origin) errors.origin = 'Mueve el mapa hasta el punto donde recogen la carga';
        if (!draft.destination) errors.destination = 'Elige a dónde va la carga';
    }
    if (step === 1) {
        if (draft.description.trim().length < 3) errors.description = 'Cuenta qué vas a mover, por ejemplo "nevera y 6 cajas"';
        if (!isPositive(draft.weightKg)) errors.weightKg = 'Escribe el peso aproximado';
    }
    if (step === 2) {
        if (!isPositive(draft.lengthCm)) errors.lengthCm = 'Falta el largo';
        if (!isPositive(draft.widthCm)) errors.widthCm = 'Falta el ancho';
        if (!isPositive(draft.heightCm)) errors.heightCm = 'Falta el alto';
        const suggested = suggestedVehicleFor(draft);
        if (hasSize(draft) && suggested === null) {
            errors.vehicleType = 'La carga no cabe ni en un camión; divídela en varios fletes';
        } else if (suggested && draft.vehicleType && vehicleRank(draft.vehicleType) < vehicleRank(suggested)) {
            // Pasa si el cliente eligió vehículo y después agrandó las medidas
            errors.vehicleType = 'El vehículo que elegiste es pequeño para estas medidas; elige otro';
        }
    }
    if (step === 3) {
        if (draft.fare <= 0) errors.fare = 'Ponle un precio a tu flete';
        if (draft.otherSender && !draft.senderName.trim()) errors.senderName = 'Falta el nombre';
        if (draft.otherSender && !PHONE_REGEX.test(draft.senderPhone)) errors.senderPhone = 'Celular de 10 dígitos que empiece por 3';
        if (draft.otherReceiver && !draft.receiverName.trim()) errors.receiverName = 'Falta el nombre';
        if (draft.otherReceiver && !PHONE_REGEX.test(draft.receiverPhone)) errors.receiverPhone = 'Celular de 10 dígitos que empiece por 3';
        if (!draft.noProhibitedItems) errors.noProhibitedItems = 'Confírmalo para poder publicar el flete';
    }
    return errors;
}

// Lo que se manda al backend al publicar
export const toClientRequest = (draft: RequestDraft, idClient: number): ClientRequest => ({
    id_client: idClient,
    pickup_lat: draft.origin!.lat,
    pickup_lng: draft.origin!.lng,
    pickup_description: draft.origin!.address,
    destination_lat: draft.destination!.lat,
    destination_lng: draft.destination!.lng,
    destination_description: draft.destination!.address,
    fare_offered: draft.fare,
    cargo_description: draft.description.trim(),
    weight_kg: toNumber(draft.weightKg),
    length_cm: toNumber(draft.lengthCm),
    width_cm: toNumber(draft.widthCm),
    height_cm: toNumber(draft.heightCm),
    cargo_category: draft.category,
    packages: draft.packages,
    is_fragile: draft.isFragile,
    needs_cover: draft.needsCover,
    vehicle_type: draft.vehicleType ?? undefined,
    no_prohibited_items: draft.noProhibitedItems,
    helpers: draft.helpers,
    pickup_floor: draft.pickupFloor,
    pickup_has_elevator: draft.pickupFloor > 1 ? draft.pickupElevator : undefined,
    destination_floor: draft.destinationFloor,
    destination_has_elevator: draft.destinationFloor > 1 ? draft.destinationElevator : undefined,
    sender_name: draft.otherSender ? draft.senderName.trim() : undefined,
    sender_phone: draft.otherSender ? draft.senderPhone : undefined,
    receiver_name: draft.otherReceiver ? draft.receiverName.trim() : undefined,
    receiver_phone: draft.otherReceiver ? draft.receiverPhone : undefined,
    scheduled_at: draft.scheduledAt ? draft.scheduledAt.toISOString() : undefined,
});

// Dirección corta para el resumen: "Cl. 68a Sur # 78L-9, Bosa" en vez de la dirección completa con ciudad y país
export const shortAddress = (address?: string) => address?.split(',').slice(0, 2).join(',').trim() ?? '';
