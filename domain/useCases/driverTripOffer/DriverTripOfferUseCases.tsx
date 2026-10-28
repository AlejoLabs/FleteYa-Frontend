import { CreateDriverTripOfferUseCase } from "./CreateDriverTripOfferUseCase";
import { GetDriverTripOfferUseCase } from "./GetDriverTripOfferUseCase";
import { ChangeDriverTripOfferStatusUseCase } from "./ChangeDriverTripOfferStatusUseCase";

export class DriverTripOfferUseCases {
    create: CreateDriverTripOfferUseCase;
    getDriverTripOffers: GetDriverTripOfferUseCase;
    changeStatus: ChangeDriverTripOfferStatusUseCase;

    constructor(
        {
           createDriverTripOfferUseCase,
           getDriverTripOfferUseCase,
           changeDriverTripOfferStatusUseCase
        }:
        {
            createDriverTripOfferUseCase: CreateDriverTripOfferUseCase,
            getDriverTripOfferUseCase: GetDriverTripOfferUseCase,
            changeDriverTripOfferStatusUseCase: ChangeDriverTripOfferStatusUseCase
        }
    ) {
        this.create = createDriverTripOfferUseCase;
        this.getDriverTripOffers = getDriverTripOfferUseCase;
        this.changeStatus = changeDriverTripOfferStatusUseCase;
    }
}