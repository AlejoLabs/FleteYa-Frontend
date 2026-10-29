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

    // El servidor pide de 1 a 5 estrellas
    validate(rating: number): string | null {
        return rating >= 1 && rating <= 5 ? null : 'Elige de 1 a 5 estrellas';
    }

    async updateDriverRating(idClientRequest: number, rating: number) {
        return await this.clientRequestUseCases.updateDriverRating.execute(idClientRequest, rating);
    }
}