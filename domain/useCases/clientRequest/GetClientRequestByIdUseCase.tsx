import { LatLng } from "react-native-maps";
import { ClientRequestRepository } from "../../repository/ClientRequestRepository";

export class GetClientRequestByIdUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idClientRequest: number) {
        return await this.clientRequestRepository.getClientRequestById(idClientRequest);
    }
}