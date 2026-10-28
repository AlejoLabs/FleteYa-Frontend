import { ClientRequestRepository } from "../../repository/ClientRequestRepository";
import { ErrorResponse } from "../../models/ErrorResponse";

export class DeliverClientRequestUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idClientRequest: number, code: string): Promise<boolean | ErrorResponse> {
        return await this.clientRequestRepository.deliver(idClientRequest, code);
    }
}
