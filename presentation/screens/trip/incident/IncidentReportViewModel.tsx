import { IncidentKind, IncidentStatus, NewIncidentReport } from "../../../../domain/models/IncidentReport";
import { IncidentUseCases } from "../../../../domain/useCases/incident/IncidentUseCases";
import { t, tk } from '../../../../i18n';

export const MAX_INCIDENT_PHOTOS = 4;
export const MIN_DESCRIPTION_LENGTH = 10;
export const MAX_DESCRIPTION_LENGTH = 1000;

export const INCIDENT_KINDS: { value: IncidentKind; label: string }[] = [
    { value: 'DAMAGE', label: tk('incidentReport.danoEnLaCarga') },
    { value: 'LOSS', label: tk('incidentReport.perdidaOFaltante') },
    { value: 'DELAY', label: tk('incidentReport.demoraONoSePresento') },
    { value: 'BEHAVIOR', label: tk('incidentReport.malTrato') },
    { value: 'OTHER', label: tk('incidentReport.otroProblema') },
];

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
    OPEN: tk('incidentReport.recibido'),
    IN_REVIEW: tk('incidentReport.enRevision'),
    RESOLVED: tk('incidentReport.resuelto'),
};

export const incidentKindLabel = (kind: IncidentKind) => t(INCIDENT_KINDS.find((item) => item.value === kind)?.label ?? kind);

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
        if (!form.kind) return t('incidentReport.eligeQuePaso');
        if (form.description.trim().length < MIN_DESCRIPTION_LENGTH) return t('incidentReport.cuentaQuePasoConAl', { minDescriptionLength: MIN_DESCRIPTION_LENGTH });
        if (form.photoUris.length > MAX_INCIDENT_PHOTOS) return t('incidentReport.puedesAdjuntarHastaFotos', { maxIncidentPhotos: MAX_INCIDENT_PHOTOS });
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
