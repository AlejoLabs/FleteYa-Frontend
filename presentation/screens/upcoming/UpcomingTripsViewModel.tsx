import { ClientRequestUseCases } from "../../../domain/useCases/clientRequest/ClientRequestUseCases";

export class UpcomingTripsViewModel {

    private clientRequestUseCases: ClientRequestUseCases;

    constructor({ clientRequestUseCases }: { clientRequestUseCases: ClientRequestUseCases }) {
        this.clientRequestUseCases = clientRequestUseCases;
    }

    async getMyActiveTrips() {
        return await this.clientRequestUseCases.getMyActiveTrips.execute();
    }
}
