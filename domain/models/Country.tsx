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
}

// En qué país está un punto (GET /countries/at/:lat/:lng). supported false: FleteYa no opera ahí
export type CountryAtPoint = ({ supported: true } & Country) | { supported: false };

// Reglas de una moneda para el precio de un flete
export interface CurrencyRules {
    code:      string;
    decimals:  number;
    fare_step: number;
    min_fare:  number;
    max_fare:  number;
}
