import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";

export class ClientTripRatingViewModel {
    private clientRequestUseCases: ClientRequestUseCases;

    constructor(
        {
            clientRequestUseCases
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases;
        }
    ){
        this.clientRequestUseCases = clientRequestUseCases;
    }

    async updateDriverRating(idClientRequest: number, rating: number) {
        return await this.clientRequestUseCases.updateDriverRating.execute(idClientRequest, rating);
    }
}