import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../../domain/models/TimeAndDistanceValues";
import { ClientRequestRepository } from "../../domain/repository/ClientRequestRepository";
import { ClientRequestService } from "../sources/remote/services/ClientRequestService";
import { ErrorResponse } from "../../domain/models/ErrorResponse";

export class ClientRequestRepositoryImpl implements ClientRequestRepository {

    private clientRequestService: ClientRequestService;

    constructor(
        {
            clientRequestService
        }:
        {
            clientRequestService: ClientRequestService;
        }
    ) {
        this.clientRequestService = clientRequestService;
    }

    async getTimeAndDistance(origin: LatLng, destination: LatLng): Promise<TimeAndDistanceValues | ErrorResponse> {
        return await this.clientRequestService.getTimeAndDistance(origin, destination);
    }
}