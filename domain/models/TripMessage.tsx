// Mensaje del chat del viaje entre el cliente y el conductor asignado
export interface TripMessage {
    id: number;
    id_client_request: number;
    id_sender: number;
    text: string;
    // Cuándo lo leyó quien lo recibió; null = sin leer
    read_at: string | null;
    created_at: string;
}
