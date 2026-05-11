import { LatLng } from "react-native-maps";
import { ClientRequestRepository, Status } from "../../repository/ClientRequestRepository";
import { ClientRequest } from "../../models/ClientRequest";
import { ErrorResponse } from "../../models/ErrorResponse";

export class UpdateDriverRatingUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idClientRequest: number, rating: number): Promise<boolean | ErrorResponse> {
        return await this.clientRequestRepository.updateDriverRating(idClientRequest, rating);
    }
}