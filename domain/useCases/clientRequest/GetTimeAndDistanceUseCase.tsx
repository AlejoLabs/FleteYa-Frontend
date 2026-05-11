import { LatLng } from "react-native-maps";
import { ClientRequestRepository } from "../../repository/ClientRequestRepository";

export class GetTimeAndDistanceUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(origin: LatLng, destination: LatLng, weight?: number, size?: number) {
        return await this.clientRequestRepository.getTimeAndDistance(origin, destination, weight, size);
    }
}