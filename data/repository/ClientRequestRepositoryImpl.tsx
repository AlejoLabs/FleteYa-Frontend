import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../../domain/models/TimeAndDistanceValues";
import { ClientRequestRepository, Status } from "../../domain/repository/ClientRequestRepository";
import { ClientRequestService } from "../sources/remote/services/ClientRequestService";
import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { ClientRequest, VehicleType } from "../../domain/models/ClientRequest";
import { ActiveTrip, ClientRequestResponse } from "../../domain/models/ClientRequestResponse";

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
    async raiseFare(idClientRequest: number, fare: number): Promise<boolean | ErrorResponse> {
        return await this.clientRequestService.raiseFare(idClientRequest, fare);
    }
    async cancel(idClientRequest: number, reason: string): Promise<boolean | ErrorResponse> {
        return await this.clientRequestService.cancel(idClientRequest, reason);
    }
    async dismiss(idClientRequest: number): Promise<boolean | ErrorResponse> {
        return await this.clientRequestService.dismiss(idClientRequest);
    }

    async deliver(idClientRequest: number, code: string): Promise<boolean | ErrorResponse> {
        return await this.clientRequestService.deliver(idClientRequest, code);
    }

    async confirmDelivery(idClientRequest: number): Promise<boolean | ErrorResponse> {
        return await this.clientRequestService.confirmDelivery(idClientRequest);
    }
    async getMyActiveTrips(): Promise<ActiveTrip[] | ErrorResponse> {
        return await this.clientRequestService.getMyActiveTrips();
    }
    async getByClientAssigned(idClient: number): Promise<ClientRequestResponse[] | ErrorResponse> {
        return await this.clientRequestService.getByClientAssigned(idClient);
    }
    async getByDriverAssigned(idDriver: number): Promise<ClientRequestResponse[] | ErrorResponse> {
        return await this.clientRequestService.getByDriverAssigned(idDriver);
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

    async getTimeAndDistance(origin: LatLng, destination: LatLng, weight?: number, size?: number, vehicle?: VehicleType): Promise<TimeAndDistanceValues | ErrorResponse> {
        return await this.clientRequestService.getTimeAndDistance(origin, destination, weight, size, vehicle);
    }
}