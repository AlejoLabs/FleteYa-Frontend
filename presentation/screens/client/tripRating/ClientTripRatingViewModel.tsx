import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { t } from '../../../../i18n';

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
        return rating >= 1 && rating <= 5 ? null : t('clientTripRating.eligeDe1A5');
    }

    async updateDriverRating(idClientRequest: number, rating: number) {
        return await this.clientRequestUseCases.updateDriverRating.execute(idClientRequest, rating);
    }
}