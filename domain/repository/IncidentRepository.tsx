import { ErrorResponse } from "../models/ErrorResponse";
import { IncidentReport, NewIncidentReport } from "../models/IncidentReport";

export interface IncidentRepository {

    createIncident(idClientRequest: number, report: NewIncidentReport): Promise<IncidentReport | ErrorResponse>;
    getMyIncidents(idClientRequest: number): Promise<IncidentReport[] | ErrorResponse>;
}
