import { LatLng } from "react-native-maps";
import { ClientRequestRepository } from "../../repository/ClientRequestRepository";
import { ClientRequest } from "../../models/ClientRequest";
import { ErrorResponse } from "../../models/ErrorResponse";

export class UpdateDriverAssignedUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idClientRequest: number, idDriver: number, fareAssigned: number): Promise<boolean | ErrorResponse> {
        return await this.clientRequestRepository.updateDriverAssigned(idClientRequest, idDriver, fareAssigned);
    }
}