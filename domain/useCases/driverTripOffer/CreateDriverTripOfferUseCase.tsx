import { DriverTripOffer } from "../../models/DriverTripOffer";
import { DriverTripOfferRepository } from "../../repository/DriverTripOfferRepository";

export class CreateDriverTripOfferUseCase {
    driverTripOfferRepository: DriverTripOfferRepository;

    constructor(
        {
            driverTripOfferRepository
        }:
        {
            driverTripOfferRepository: DriverTripOfferRepository;
        }
    ) {
        this.driverTripOfferRepository = driverTripOfferRepository;
    }

    async execute(driverTripOffer: DriverTripOffer) {
        return this.driverTripOfferRepository.create(driverTripOffer);
    }
}