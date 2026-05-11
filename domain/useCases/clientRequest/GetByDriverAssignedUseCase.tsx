import { LatLng } from "react-native-maps";
import { ClientRequestRepository } from "../../repository/ClientRequestRepository";

export class GetByDriverAssignedUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idDriver: number) {
        return await this.clientRequestRepository.getByDriverAssigned(idDriver);
    }
}