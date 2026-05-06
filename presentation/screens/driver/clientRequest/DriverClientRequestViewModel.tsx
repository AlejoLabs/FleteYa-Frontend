import { LatLng } from "react-native-maps";
import { ClientRequestUseCases } from "../../../../domain/useCases/clientRequest/ClientRequestUseCases";

export class DriverClientRequestViewModel {

    private clientRequestUseCases: ClientRequestUseCases;

    constructor({clientRequestUseCases}: {clientRequestUseCases: ClientRequestUseCases}) {
        this.clientRequestUseCases = clientRequestUseCases;
    }

    async getNearbyTripRequest(driverPosition: LatLng) {
        return this.clientRequestUseCases.getNearbyTripRequestUseCase.execute(driverPosition);
    }
}