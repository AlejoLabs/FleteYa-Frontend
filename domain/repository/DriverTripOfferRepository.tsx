import { DriverTripOffer } from "../models/DriverTripOffer";
import { ErrorResponse } from "../models/ErrorResponse";

export interface DriverTripOfferRepository {
    create(driverTripOffer: DriverTripOffer): Promise<DriverTripOffer | ErrorResponse>; 
}