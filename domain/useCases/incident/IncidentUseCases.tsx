import { CreateIncidentReportUseCase } from "./CreateIncidentReportUseCase";
import { GetMyIncidentReportsUseCase } from "./GetMyIncidentReportsUseCase";

export class IncidentUseCases {
    createIncident: CreateIncidentReportUseCase;
    getMyIncidents: GetMyIncidentReportsUseCase;

    constructor(
        {
            createIncidentReportUseCase,
            getMyIncidentReportsUseCase
        }:
        {
            createIncidentReportUseCase: CreateIncidentReportUseCase;
            getMyIncidentReportsUseCase: GetMyIncidentReportsUseCase;
        }
    ){
        this.createIncident = createIncidentReportUseCase;
        this.getMyIncidents = getMyIncidentReportsUseCase;
    }
}
