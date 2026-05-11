import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../../domain/models/TimeAndDistanceValues";
import { ClientRequestRepository, Status } from "../../domain/repository/ClientRequestRepository";
import { ClientRequestService } from "../sources/remote/services/ClientRequestService";
import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { ClientRequest } from "../../domain/models/ClientRequest";
import { ClientRequestResponse } from "../../domain/models/ClientRequestResponse";

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
    async updateDriverRating(idClientRequest: number, rating: number): Promise<boolean | ErrorResponse> {
        return await this.clientRequestService.updateDriverRating(idClientRequest, rating);
    }
    async updateClientRating(idClientRequest: number, rating: number): Promise<boolean | ErrorResponse> {
        return await this.clientRequestService.updateClientRating(idClientRequest, rating);
    }
    async updateStatus(idClientRequest: number, status: Status): Promise<boolean | ErrorResponse> {
        return await this.clientRequestService.updateStatus(idClientRequest, status);
    }
    async getClientRequestById(idClientRequest: number): Promise<ClientRequestResponse | ErrorResponse> {
        return await this.clientRequestService.getClientRequestById(idClientRequest);
    }
    async updateDriverAssigned(idClientRequest: number, idDriver: number, fareAssigned: number): Promise<boolean | ErrorResponse> {
       return await this.clientRequestService.updateDriverAssigned(idClientRequest, idDriver, fareAssigned);
    }
    async getNearbyTripRequest(driverPosition: LatLng): Promise<ClientRequestResponse[] | ErrorResponse> {
        return await this.clientRequestService.getNearbyTripRequest(driverPosition);
    }
    async create(clientRequest: ClientRequest): Promise<number | ErrorResponse> {
        return await this.clientRequestService.create(clientRequest);
    }

    async getTimeAndDistance(origin: LatLng, destination: LatLng): Promise<TimeAndDistanceValues | ErrorResponse> {
        return await this.clientRequestService.getTimeAndDistance(origin, destination);
    }
}