import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { IncidentReport, NewIncidentReport } from "../../../../domain/models/IncidentReport";

// Reportes de incidentes: el formulario y sus fotos van en una sola petición, así no quedan reportes a medias
export class IncidentService {

    private toErrorResponse(error: any): ErrorResponse {
        if (error.response) {
            console.log('Error del servidor', error.response.data?.message);
            return error.response.data;
        }
        console.log('Error en la peticion', error.message);
        return defaultErrorResponse;
    }

    async createIncident(idClientRequest: number, report: NewIncidentReport): Promise<IncidentReport | ErrorResponse> {
        try {
            const formData = new FormData();
            formData.append('kind', report.kind);
            formData.append('description', report.description);
            report.photoUris.forEach((uri, index) => {
                formData.append('photos', { uri, name: `foto${index + 1}.jpg`, type: 'image/jpeg' } as any);
            });
            const response = await ApiRequestHandler.post<IncidentReport>(`/client-requests/${idClientRequest}/incidents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                // Hasta 4 fotos de unos 300 KB
                timeout: 60000,
            });
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async getMyIncidents(idClientRequest: number): Promise<IncidentReport[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<IncidentReport[]>(`/client-requests/${idClientRequest}/incidents`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }
}
