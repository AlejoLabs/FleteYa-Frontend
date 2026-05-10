import { LatLng } from "react-native-maps";
import { ClientRequestRepository, Status } from "../../repository/ClientRequestRepository";
import { ClientRequest } from "../../models/ClientRequest";
import { ErrorResponse } from "../../models/ErrorResponse";

export class UpdateStatusUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idClientRequest: number, status: Status): Promise<boolean | ErrorResponse> {
        return await this.clientRequestRepository.updateStatus(idClientRequest, status);
    }
}