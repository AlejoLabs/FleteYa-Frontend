import { LatLng } from "react-native-maps";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { DriverPositionUseCases } from "../../../../domain/useCases/driverPosition/DriverPositionUseCases";
import { DriverTripOfferUseCases } from "../../../../domain/useCases/driverTripOffer/DriverTripOfferUseCases";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";

export class DriverClientRequestViewModel {

    private clientRequestUseCases: ClientRequestUseCases;
    private driverPositionUseCases: DriverPositionUseCases;
    private driverTripOfferUseCases: DriverTripOfferUseCases;

    constructor(
        {
            clientRequestUseCases,
            driverPositionUseCases,
            driverTripOfferUseCases
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases,
            driverPositionUseCases: DriverPositionUseCases,
            driverTripOfferUseCases: DriverTripOfferUseCases
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.driverPositionUseCases = driverPositionUseCases;
        this.driverTripOfferUseCases = driverTripOfferUseCases;
    }

    async getNearbyTripRequest(driverPosition: LatLng) {
        return this.clientRequestUseCases.getNearbyTripRequestUseCase.execute(driverPosition);
    }

    async getDriverPosition(idDriver: number) {
        return await this.driverPositionUseCases.getDriverPosition.execute(idDriver);
    }

    async createDriverTripOffer(driverTripOffer: DriverTripOffer) {
        return await this.driverTripOfferUseCases.create.execute(driverTripOffer);
    }
}