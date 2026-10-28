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
    async changeStatus(idOffer: number, action: 'reject' | 'withdraw'): Promise<boolean | ErrorResponse> {
        return await this.driverTripOfferService.changeStatus(idOffer, action);
    }
    async getDriverTripOffers(idClientRequest: number): Promise<DriverTripOffer[] | ErrorResponse> {
        return await this.driverTripOfferService.getDriverTripOffers(idClientRequest);
    }
    
    async create(driverTripOffer: DriverTripOffer): Promise<DriverTripOffer | ErrorResponse> {
        return await this.driverTripOfferService.create(driverTripOffer);
    }

}