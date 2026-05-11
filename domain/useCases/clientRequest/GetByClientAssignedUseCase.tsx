import { LatLng } from "react-native-maps";
import { ClientRequestRepository } from "../../repository/ClientRequestRepository";

export class GetByClientAssignedUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idClient: number) {
        return await this.clientRequestRepository.getByClientAssigned(idClient);
    }
}