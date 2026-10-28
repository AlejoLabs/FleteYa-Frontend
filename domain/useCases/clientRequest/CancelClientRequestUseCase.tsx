import { ClientRequestRepository } from "../../repository/ClientRequestRepository";
import { ErrorResponse } from "../../models/ErrorResponse";

export class CancelClientRequestUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idClientRequest: number, reason: string): Promise<boolean | ErrorResponse> {
        return await this.clientRequestRepository.cancel(idClientRequest, reason);
    }
}
