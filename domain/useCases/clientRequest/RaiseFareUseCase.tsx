import { ClientRequestRepository } from "../../repository/ClientRequestRepository";
import { ErrorResponse } from "../../models/ErrorResponse";

export class RaiseFareUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idClientRequest: number, fare: number): Promise<boolean | ErrorResponse> {
        return await this.clientRequestRepository.raiseFare(idClientRequest, fare);
    }
}
