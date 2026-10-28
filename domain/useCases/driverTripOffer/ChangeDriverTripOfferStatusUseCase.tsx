import { DriverTripOfferRepository } from "../../repository/DriverTripOfferRepository";
import { ErrorResponse } from "../../models/ErrorResponse";

export class ChangeDriverTripOfferStatusUseCase {
    private driverTripOfferRepository: DriverTripOfferRepository;

    constructor({driverTripOfferRepository}: {driverTripOfferRepository: DriverTripOfferRepository}){
        this.driverTripOfferRepository = driverTripOfferRepository;
    }

    async execute(idOffer: number, action: 'reject' | 'withdraw'): Promise<boolean | ErrorResponse> {
        return await this.driverTripOfferRepository.changeStatus(idOffer, action);
    }
}
