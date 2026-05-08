import { DriverTripOffer } from "../../domain/models/DriverTripOffer";
import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { DriverTripOfferRepository } from "../../domain/repository/DriverTripOfferRepository";
import { DriverTripOfferService } from "../sources/remote/services/DriverTripOfferService";

export class DriverTripOfferRepositoryImpl implements DriverTripOfferRepository {
    private driverTripOfferService: DriverTripOfferService;

    constructor(
        {
            driverTripOfferService
        }:
        {
            driverTripOfferService: DriverTripOfferService;
        }
    ) {
        this.driverTripOfferService = driverTripOfferService;
    }
    
    async create(driverTripOffer: DriverTripOffer): Promise<DriverTripOffer | ErrorResponse> {
        return await this.driverTripOfferService.create(driverTripOffer);
    }

}