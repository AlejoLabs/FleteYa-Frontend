import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";

export class ClientTripHistoryViewModel {
    private clientRequestUseCases: ClientRequestUseCases;

    constructor(
        {
            clientRequestUseCases
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases
        }
    ){
        this.clientRequestUseCases = clientRequestUseCases;
    }

    async getByClientAssigned(idClient: number) {
        return await this.clientRequestUseCases.getByClientAssigned.execute(idClient);
    }
}