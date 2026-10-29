// Sugerencia del autocompletado de Google mientras se escribe una dirección
export interface PlacePrediction {
    place_id: string;
    description: string;
    structured_formatting?: {
        main_text: string;
        secondary_text?: string;
    };
}

export interface PlaceAutocomplete {
    status: string;
    predictions: PlacePrediction[];
    error_message?: string;
}
