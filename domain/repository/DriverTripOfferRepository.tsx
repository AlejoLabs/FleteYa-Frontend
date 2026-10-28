import { DriverTripOffer } from "../models/DriverTripOffer";
import { ErrorResponse } from "../models/ErrorResponse";

export interface DriverTripOfferRepository {
    create(driverTripOffer: DriverTripOffer): Promise<DriverTripOffer | ErrorResponse>; 
    getDriverTripOffers(idClientRequest: number): Promise<DriverTripOffer[] | ErrorResponse>;
    changeStatus(idOffer: number, action: 'reject' | 'withdraw'): Promise<boolean | ErrorResponse>;
}