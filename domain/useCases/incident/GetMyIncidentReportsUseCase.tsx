import { IncidentRepository } from "../../repository/IncidentRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { IncidentReport } from "../../models/IncidentReport";

export class GetMyIncidentReportsUseCase {
    private incidentRepository: IncidentRepository;

    constructor({incidentRepository}: {incidentRepository: IncidentRepository}){
        this.incidentRepository = incidentRepository;
    }

    async execute(idClientRequest: number): Promise<IncidentReport[] | ErrorResponse> {
        return await this.incidentRepository.getMyIncidents(idClientRequest);
    }
}
