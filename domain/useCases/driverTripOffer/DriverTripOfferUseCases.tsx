import { CreateDriverTripOfferUseCase } from "./CreateDriverTripOfferUseCase";
import { GetDriverTripOfferUseCase } from "./GetDriverTripOfferUseCase";

export class DriverTripOfferUseCases {
    create: CreateDriverTripOfferUseCase;
    getDriverTripOffers: GetDriverTripOfferUseCase;

    constructor(
        {
           createDriverTripOfferUseCase,
           getDriverTripOfferUseCase
        }:
        {
            createDriverTripOfferUseCase: CreateDriverTripOfferUseCase,
            getDriverTripOfferUseCase: GetDriverTripOfferUseCase
        }
    ) {
        this.create = createDriverTripOfferUseCase;
        this.getDriverTripOffers = getDriverTripOfferUseCase;
    }
}