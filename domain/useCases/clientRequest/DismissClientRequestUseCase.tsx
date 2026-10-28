import { ClientRequestRepository } from "../../repository/ClientRequestRepository";
import { ErrorResponse } from "../../models/ErrorResponse";

export class DismissClientRequestUseCase {
    private clientRequestRepository: ClientRequestRepository;

    constructor({clientRequestRepository}: {clientRequestRepository: ClientRequestRepository}){
        this.clientRequestRepository = clientRequestRepository;
    }

    async execute(idClientRequest: number): Promise<boolean | ErrorResponse> {
        return await this.clientRequestRepository.dismiss(idClientRequest);
    }
}
