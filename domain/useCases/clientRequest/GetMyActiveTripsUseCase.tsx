import { ClientRequestRepository } from "../../repository/ClientRequestRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { ActiveTrip } from "../../models/ClientRequestResponse";
export class GetMyActiveTripsUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(): Promise<ActiveTrip[] | ErrorResponse> {
        return await this.clientRequestRepository.getMyActiveTrips();
    }
}
