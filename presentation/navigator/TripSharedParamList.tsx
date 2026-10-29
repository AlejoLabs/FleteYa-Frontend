// Pantallas del viaje que usan el cliente y el conductor; cada stack las registra con estos parámetros
export type TripSharedParamList = {
    // otherName: a quién se le escribe, para el título. readOnly: el viaje ya terminó y solo se lee el historial
    TripChatScreen: { idClientRequest: number; otherName?: string; readOnly?: boolean };
    IncidentReportScreen: { idClientRequest: number };
}
