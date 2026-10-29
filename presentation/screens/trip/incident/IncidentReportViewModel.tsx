import { IncidentKind, IncidentStatus, NewIncidentReport } from "../../../../domain/models/IncidentReport";
import { IncidentUseCases } from "../../../../domain/useCases/incident/IncidentUseCases";

export const MAX_INCIDENT_PHOTOS = 4;
export const MIN_DESCRIPTION_LENGTH = 10;
export const MAX_DESCRIPTION_LENGTH = 1000;

export const INCIDENT_KINDS: { value: IncidentKind; label: string }[] = [
    { value: 'DAMAGE', label: 'Daño en la carga' },
    { value: 'LOSS', label: 'Pérdida o faltante' },
    { value: 'DELAY', label: 'Demora o no se presentó' },
    { value: 'BEHAVIOR', label: 'Mal trato' },
    { value: 'OTHER', label: 'Otro problema' },
];

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
    OPEN: 'Recibido',
    IN_REVIEW: 'En revisión',
    RESOLVED: 'Resuelto',
};

export const incidentKindLabel = (kind: IncidentKind) => INCIDENT_KINDS.find((item) => item.value === kind)?.label ?? kind;

export interface IncidentForm {
    kind: IncidentKind | null;
    description: string;
    photoUris: string[];
}

export const EMPTY_INCIDENT_FORM: IncidentForm = { kind: null, description: '', photoUris: [] };

export class IncidentReportViewModel {

    private incidentUseCases: IncidentUseCases;

    constructor({ incidentUseCases }: { incidentUseCases: IncidentUseCases }) {
        this.incidentUseCases = incidentUseCases;
    }

    // Devuelve el primer problema del formulario, o null si se puede enviar
    validate(form: IncidentForm): string | null {
        if (!form.kind) return 'Elige qué pasó';
        if (form.description.trim().length < MIN_DESCRIPTION_LENGTH) return `Cuenta qué pasó con al menos ${MIN_DESCRIPTION_LENGTH} caracteres`;
        if (form.photoUris.length > MAX_INCIDENT_PHOTOS) return `Puedes adjuntar hasta ${MAX_INCIDENT_PHOTOS} fotos`;
        return null;
    }

    async createIncident(idClientRequest: number, form: IncidentForm) {
        const report: NewIncidentReport = { kind: form.kind!, description: form.description.trim(), photoUris: form.photoUris };
        return await this.incidentUseCases.createIncident.execute(idClientRequest, report);
    }

    async getMyIncidents(idClientRequest: number) {
        return await this.incidentUseCases.getMyIncidents.execute(idClientRequest);
    }
}
