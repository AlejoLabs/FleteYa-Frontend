import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";

export class ClientTripMapViewModel {
    
    private clientRequestUseCases: ClientRequestUseCases;

    constructor(
        {
            clientRequestUseCases
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
    }

    async getClientRequestById(idClientRequest: number) {
        return await this.clientRequestUseCases.getClientRequestById.execute(idClientRequest);
    }
}