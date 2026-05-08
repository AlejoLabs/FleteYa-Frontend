import { CreateDriverTripOfferUseCase } from "./CreateDriverTripOfferUseCase";

export class DriverTripOfferUseCases {
    create: CreateDriverTripOfferUseCase;

    constructor(
        {
           createDriverTripOfferUseCase
        }:
        {
            createDriverTripOfferUseCase: CreateDriverTripOfferUseCase
        }
    ) {
        this.create = createDriverTripOfferUseCase;
    }
}