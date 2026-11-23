// País donde opera FleteYa (GET /countries). Lo que la app necesita para el registro, el buscador y los precios
export interface Country {
    code:             string;
    // Nombre en cada idioma de la app: { es: "Alemania", de: "Deutschland", ... }
    names:            Record<string, string>;
    // Moneda del país (COP, EUR...) y sus reglas para el precio de un flete
    currency:         string;
    decimals:         number;
    fare_step:        number;
    min_fare:         number;
    max_fare:         number;
    // Idioma con el que arranca alguien de ese país
    default_language: string;
    phone_prefix:     string;
    // Celular sin indicativo, como expresión regular
    phone_pattern:    string;
    phone_example:    string;
    // null = placa libre (2 a 10 letras o números)
    plate_pattern:    string | null;
    // Impuesto, comprobante y propina del país (Fase 11). tax_rate es una fracción (0.19 = 19 %)
    tax_name:         string;
    tax_rate:         number;
    // Clave del tipo de comprobante: la app la traduce con receipt.types.<clave>
    receipt_type:     string;
    tax_id_label:     string;
    tip_mode:         TipMode;
    // Porcentajes de los botones cuando tip_mode es SUGGESTED, por ejemplo [15, 18, 20]
    tip_suggestions:  number[];
}

// NONE: no se pide propina. OPTIONAL: campo libre. SUGGESTED: botones con porcentajes
export type TipMode = 'NONE' | 'OPTIONAL' | 'SUGGESTED';

// En qué país está un punto (GET /countries/at/:lat/:lng). supported false: FleteYa no opera ahí
export type CountryAtPoint = ({ supported: true } & Country) | { supported: false };

// Tasas de cambio de referencia (GET /exchange-rates, base USD). Solo para mostrar "≈ US$27": nunca para cobrar
export interface ExchangeRate {
    // Unidades de la moneda por 1 dólar
    units_per_usd: number;
    source:        string;
    rate_date:     string;
    // La fuente no respondió y es la última tasa guardada
    stale:         boolean;
}

export interface ExchangeRates {
    base:  'USD';
    rates: Record<string, ExchangeRate>;
}

// Reglas de una moneda para el precio de un flete
export interface CurrencyRules {
    code:      string;
    decimals:  number;
    fare_step: number;
    min_fare:  number;
    max_fare:  number;
}
