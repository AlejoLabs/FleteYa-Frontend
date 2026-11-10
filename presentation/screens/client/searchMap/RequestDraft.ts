import { CargoCategory, ClientRequest, PaymentMethod, VehicleType } from "../../../../domain/models/ClientRequest";
import { suggestVehicle, vehicleRank } from "../../../utils/Cargo";
import { t, tk } from '../../../../i18n';
import { CountryAtPoint } from "../../../../domain/models/Country";
import { supportedCountriesText } from "../../../utils/Countries";

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
    // Valor aproximado de la carga, opcional
    declaredValue: string;
    // Lo normal es que el cliente suba y reciba la carga y el precio cubra solo el transporte.
    // Si pide ayuda, los ayudantes y los pisos le dicen al conductor qué incluir en su oferta
    needsHelp: boolean;
    helpers: number;
    pickupFloor: number;
    pickupElevator: boolean;
    destinationFloor: number;
    destinationElevator: boolean;
    // Paso 3: medidas del artículo más grande, cuidados y vehículo
    lengthCm: string;
    widthCm: string;
    heightCm: string;
    isFragile: boolean;
    needsCover: boolean;
    // Fotos ya comprimidas en el teléfono; se suben después de crear la solicitud
    photos: string[];
    // null = el sugerido por peso y medidas
    vehicleType: VehicleType | null;
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
    // Se paga al terminar: en efectivo al conductor o por la app
    paymentMethod: PaymentMethod;
}

export const EMPTY_DRAFT: RequestDraft = {
    origin: null,
    destination: null,
    category: 'MUDANZA',
    description: '',
    weightKg: '',
    packages: 1,
    declaredValue: '',
    needsHelp: false,
    helpers: 1,
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
    paymentMethod: 'CASH',
};

export const REQUEST_STEPS = [tk('requestDraft.ruta'), tk('requestDraft.carga'), tk('requestDraft.medidas'), tk('requestDraft.precio')];
export const MAX_CARGO_PHOTOS = 4;
export type DraftField = keyof RequestDraft;
export type DraftErrors = Partial<Record<DraftField, string>>;

// Celular colombiano: 10 dígitos empezando por 3. En los demás países, el formato que manda el backend
const PHONE_REGEX = /^3\d{9}$/;

const toNumber = (value: string) => Number(value.replace(',', '.'));
const isPositive = (value: string) => value.trim() !== '' && !isNaN(toNumber(value)) && toNumber(value) > 0;

export const hasSize = (draft: RequestDraft) =>
    isPositive(draft.weightKg) && isPositive(draft.lengthCm) && isPositive(draft.widthCm) && isPositive(draft.heightCm);

// Vehículo más pequeño donde cabe la carga; null si todavía no hay medidas o no cabe ni en un camión
export const suggestedVehicleFor = (draft: RequestDraft): VehicleType | null => hasSize(draft)
    ? suggestVehicle(toNumber(draft.weightKg), toNumber(draft.lengthCm), toNumber(draft.widthCm), toNumber(draft.heightCm), draft.packages)
    : null;

// Volumen del artículo más grande en m³, como lo pide el cálculo del precio
export const sizeM3 = (draft: RequestDraft) =>
    (toNumber(draft.lengthCm) / 100) * (toNumber(draft.widthCm) / 100) * (toNumber(draft.heightCm) / 100);

export const weightKg = (draft: RequestDraft) => toNumber(draft.weightKg);

// Errores del paso; vacío si se puede seguir. pickupCountry: el país de la recogida según el backend (null si
// todavía no se sabe): decide el formato de los celulares de contacto y si FleteYa opera ahí
export const validateStep = (step: number, draft: RequestDraft, pickupCountry?: CountryAtPoint | null): DraftErrors => {
    const errors: DraftErrors = {};
    const country = pickupCountry?.supported ? pickupCountry : null;
    const phonePattern = !country || country.code === 'CO' ? PHONE_REGEX : new RegExp(country.phone_pattern);
    const phoneError = !country || country.code === 'CO'
        ? t('requestDraft.celularDe10DigitosQue')
        : t('common.celularNoValido', { example: country.phone_example });
    if (step === 0) {
        if (!draft.origin) errors.origin = t('requestDraft.mueveElMapaHastaEl');
        // En un país sin FleteYa no se puede pedir el flete; la lista de países va en el idioma de la app
        else if (pickupCountry && !pickupCountry.supported) errors.origin = t('errors.COUNTRY_NOT_SUPPORTED', { countries: supportedCountriesText() });
        if (!draft.destination) errors.destination = t('requestDraft.eligeADondeVaLa');
    }
    if (step === 1) {
        if (draft.description.trim().length < 3) errors.description = t('requestDraft.cuentaQueVasAMover');
        if (!isPositive(draft.weightKg)) errors.weightKg = t('requestDraft.escribeElPesoAproximado');
        if (draft.declaredValue.trim() !== '' && isNaN(toNumber(draft.declaredValue))) errors.declaredValue = t('requestDraft.escribeSoloElNumeroSin');
    }
    if (step === 2) {
        if (!isPositive(draft.lengthCm)) errors.lengthCm = t('requestDraft.faltaElLargo');
        if (!isPositive(draft.widthCm)) errors.widthCm = t('requestDraft.faltaElAncho');
        if (!isPositive(draft.heightCm)) errors.heightCm = t('requestDraft.faltaElAlto');
        const suggested = suggestedVehicleFor(draft);
        if (hasSize(draft) && suggested === null) {
            errors.vehicleType = t('requestDraft.laCargaNoCabeNi');
        } else if (suggested && draft.vehicleType && vehicleRank(draft.vehicleType) < vehicleRank(suggested)) {
            // Pasa si el cliente eligió vehículo y después agrandó las medidas
            errors.vehicleType = t('requestDraft.elVehiculoQueElegisteEs');
        }
    }
    if (step === 3) {
        if (draft.fare <= 0) errors.fare = t('requestDraft.ponleUnPrecioATu');
        if (draft.otherSender && !draft.senderName.trim()) errors.senderName = t('requestDraft.faltaElNombre');
        if (draft.otherSender && !phonePattern.test(draft.senderPhone)) errors.senderPhone = phoneError;
        if (draft.otherReceiver && !draft.receiverName.trim()) errors.receiverName = t('requestDraft.faltaElNombre');
        if (draft.otherReceiver && !phonePattern.test(draft.receiverPhone)) errors.receiverPhone = phoneError;
        if (!draft.noProhibitedItems) errors.noProhibitedItems = t('requestDraft.confirmaloParaPoderPublicarEl');
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
    // Sin ayuda no se mandan ayudantes ni pisos: el conductor ve "Solo transporte"
    helpers: draft.needsHelp ? draft.helpers : 0,
    pickup_floor: draft.needsHelp ? draft.pickupFloor : undefined,
    pickup_has_elevator: draft.needsHelp && draft.pickupFloor > 1 ? draft.pickupElevator : undefined,
    destination_floor: draft.needsHelp ? draft.destinationFloor : undefined,
    destination_has_elevator: draft.needsHelp && draft.destinationFloor > 1 ? draft.destinationElevator : undefined,
    sender_name: draft.otherSender ? draft.senderName.trim() : undefined,
    sender_phone: draft.otherSender ? draft.senderPhone : undefined,
    receiver_name: draft.otherReceiver ? draft.receiverName.trim() : undefined,
    receiver_phone: draft.otherReceiver ? draft.receiverPhone : undefined,
    scheduled_at: draft.scheduledAt ? draft.scheduledAt.toISOString() : undefined,
    payment_method: draft.paymentMethod,
    declared_value: isPositive(draft.declaredValue) ? toNumber(draft.declaredValue) : undefined,
});

// Dirección corta para el resumen: "Cl. 68a Sur # 78L-9, Bosa" en vez de la dirección completa con ciudad y país
export const shortAddress = (address?: string) => address?.split(',').slice(0, 2).join(',').trim() ?? '';
