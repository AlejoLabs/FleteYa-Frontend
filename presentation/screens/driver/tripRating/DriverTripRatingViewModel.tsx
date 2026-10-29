import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";

export class DriverTripRatingViewModel {
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

    async updateClientRating(idClientRequest: number, rating: number) {
        return await this.clientRequestUseCases.updateClientRating.execute(idClientRequest, rating);
    }
}