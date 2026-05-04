import { LatLng } from "react-native-maps";
import { ClientRequestRepository } from "../../repository/ClientRequestRepository";
import { ClientRequest } from "../../models/ClientRequest";
import { ErrorResponse } from "../../models/ErrorResponse";

export class CreateClientRequestUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(clientRequest: ClientRequest): Promise<number | ErrorResponse> {
        return await this.clientRequestRepository.create(clientRequest);
    }
}