import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { IncidentReport, NewIncidentReport } from "../../domain/models/IncidentReport";
import { IncidentRepository } from "../../domain/repository/IncidentRepository";
import { IncidentService } from "../sources/remote/services/IncidentService";

export class IncidentRepositoryImpl implements IncidentRepository {

    private incidentService: IncidentService;

    constructor({ incidentService }: { incidentService: IncidentService }) {
        this.incidentService = incidentService;
    }

    async createIncident(idClientRequest: number, report: NewIncidentReport): Promise<IncidentReport | ErrorResponse> {
        return await this.incidentService.createIncident(idClientRequest, report);
    }
    async getMyIncidents(idClientRequest: number): Promise<IncidentReport[] | ErrorResponse> {
        return await this.incidentService.getMyIncidents(idClientRequest);
    }
}
