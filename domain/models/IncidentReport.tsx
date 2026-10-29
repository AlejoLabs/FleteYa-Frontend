import { Photo } from "./Photo";

export type IncidentKind = 'DAMAGE' | 'LOSS' | 'DELAY' | 'BEHAVIOR' | 'OTHER';
export type IncidentStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED';

// Reporte de daño, pérdida u otro problema de un viaje. Lo ve quien lo hizo y lo revisa el administrador
export interface IncidentReport {
    id: number;
    id_client_request: number;
    kind: IncidentKind;
    description: string;
    status: IncidentStatus;
    created_at: string;
    photos: Pick<Photo, 'id' | 'url'>[];
}

// Lo que llena la persona; las fotos son archivos locales ya comprimidos por PhotoPicker
export interface NewIncidentReport {
    kind: IncidentKind;
    description: string;
    photoUris: string[];
}
