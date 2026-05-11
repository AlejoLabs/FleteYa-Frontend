import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";

export class DriverTripHistoryViewModel {
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

    async getByDriverAssigned(idDriver: number) {
        return await this.clientRequestUseCases.getByDriverAssigned.execute(idDriver);
    }
}