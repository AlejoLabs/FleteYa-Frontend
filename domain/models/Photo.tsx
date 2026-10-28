// CARGO: la carga que muestra el cliente al pedir el flete. PICKUP y DELIVERY: prueba de entrega del conductor
export type TripPhotoKind = 'CARGO' | 'PICKUP' | 'DELIVERY';

// La url es relativa al backend y necesita el token: se muestra con AuthImage
export interface Photo {
    id: number;
    kind?: TripPhotoKind;
    url: string;
    created_at: string;
}
