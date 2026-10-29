import { IncidentRepository } from "../../repository/IncidentRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { IncidentReport, NewIncidentReport } from "../../models/IncidentReport";

export class CreateIncidentReportUseCase {
    private incidentRepository: IncidentRepository;

    constructor({incidentRepository}: {incidentRepository: IncidentRepository}){
        this.incidentRepository = incidentRepository;
    }

    async execute(idClientRequest: number, report: NewIncidentReport): Promise<IncidentReport | ErrorResponse> {
        return await this.incidentRepository.createIncident(idClientRequest, report);
    }
}
