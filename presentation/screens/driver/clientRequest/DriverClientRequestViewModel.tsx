import { LatLng } from "react-native-maps";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";
import { DriverPositionUseCases } from "../../../../domain/useCases/driverPosition/DriverPositionUseCases";

export class DriverClientRequestViewModel {

    private clientRequestUseCases: ClientRequestUseCases;
    private driverPositionUseCases: DriverPositionUseCases;

    constructor(
        {
            clientRequestUseCases,
            driverPositionUseCases
        }: 
        {
            clientRequestUseCases: ClientRequestUseCases,
            driverPositionUseCases: DriverPositionUseCases
        }
    ) {
        this.clientRequestUseCases = clientRequestUseCases;
        this.driverPositionUseCases = driverPositionUseCases;
    }

    async getNearbyTripRequest(driverPosition: LatLng) {
        return this.clientRequestUseCases.getNearbyTripRequestUseCase.execute(driverPosition);
    }

    async getDriverPosition(idDriver: number) {
        return await this.driverPositionUseCases.getDriverPosition.execute(idDriver);
    }
}