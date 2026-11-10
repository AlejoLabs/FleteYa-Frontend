import { t } from '../../i18n';
import { countryByCode } from './Countries';

// Placa, licencia y documentos del vehículo según el país del conductor (el de su cuenta, que sale del indicativo).
// Colombia sigue con sus reglas de siempre: placa ABC123, licencias B1 a C3 (el camión pide B2/C2 o más), SOAT y
// técnico-mecánica. En los demás países, placa libre y los mismos documentos con nombres genéricos.
// Las reglas de Colombia son de su ley de tránsito; un país nuevo usa las genéricas sin cambiar código

const COLOMBIA_PLATE = /^[A-Z]{3}\d{3}$/;
const GENERIC_PLATE = /^[A-Z0-9]{2,10}$/;
const COLOMBIA_LICENSES = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
const COLOMBIA_HEAVY = ['B2', 'B3', 'C2', 'C3'];
// Las categorías más comunes fuera de Colombia: B (carro y camioneta), C1 y C (camión), CE (con remolque), D (bus)
const GENERIC_LICENSES = ['B', 'C1', 'C', 'CE', 'D'];

export interface VehicleRules {
    isColombia: boolean;
    platePlaceholder: string;
    plateMaxLength: number;
    licenseCategories: string[];
    // null = el país no limita la categoría para manejar un camión
    heavyCategories: string[] | null;
}

export const vehicleRules = (countryCode?: string | null): VehicleRules => {
    const isColombia = !countryCode || countryCode === 'CO';
    return isColombia
        ? { isColombia, platePlaceholder: 'ABC123', plateMaxLength: 7, licenseCategories: COLOMBIA_LICENSES, heavyCategories: COLOMBIA_HEAVY }
        : { isColombia, platePlaceholder: 'AB123CD', plateMaxLength: 12, licenseCategories: GENERIC_LICENSES, heavyCategories: null };
}

export const normalizePlate = (plate: string) => plate.toUpperCase().replace(/[\s-]/g, '');

// Error de la placa; undefined si está bien. colombiaMessage: el texto de siempre ("3 letras y 3 números")
export const plateError = (plate: string, countryCode: string | null | undefined, colombiaMessage: string): string | undefined => {
    const value = normalizePlate(plate);
    if (vehicleRules(countryCode).isColombia) return COLOMBIA_PLATE.test(value) ? undefined : colombiaMessage;
    const pattern = countryByCode(countryCode)?.plate_pattern;
    const valid = pattern ? new RegExp(pattern).test(value) : GENERIC_PLATE.test(value);
    return valid ? undefined : t('vehicleRules.placaNoValida');
}

// ¿Esta categoría permite manejar un camión en ese país?
export const allowsTruck = (category: string | null | undefined, countryCode?: string | null): boolean => {
    const heavy = vehicleRules(countryCode).heavyCategories;
    return heavy === null || heavy.includes(category ?? '');
}

// Clave del nombre de un documento (docs.*): SOAT y TECHNO son de Colombia; en otro país, seguro y revisión técnica
export const docNameKey = (key: string, countryCode?: string | null): string => {
    if (vehicleRules(countryCode).isColombia) return key;
    return key === 'SOAT' ? 'INSURANCE' : key === 'TECHNO' ? 'INSPECTION' : key;
}

// Etiquetas de los campos de documentos en los formularios (registro y Mi vehículo)
export const documentLabels = (countryCode: string | null | undefined, colombia: { soat: string; techno: string; propertyCard: string }) =>
    vehicleRules(countryCode).isColombia
        ? colombia
        : { soat: t('vehicleRules.seguroVenceEl'), techno: t('vehicleRules.revisionTecnicaVenceEl'), propertyCard: t('vehicleRules.numeroDelRegistro') };
