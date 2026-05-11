import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../models/TimeAndDistanceValues";
import { ErrorResponse } from "../models/ErrorResponse";
import { ClientRequest } from "../models/ClientRequest";
import { ClientRequestResponse } from "../models/ClientRequestResponse";

export enum Status {
    CREATED = 'CREATED',
    ACCEPTED = 'ACCEPTED',
    ON_THE_WAY = 'ON_THE_WAY',
    ARRIVED = 'ARRIVED',
    TRAVELING = 'TRAVELING',
    FINISHED = 'FINISHED',
    CANCELLED = 'CANCELLED'
}

export interface ClientRequestRepository {

    create(clientRequest: ClientRequest): Promise<number | ErrorResponse>;
    getTimeAndDistance(origin:LatLng, destination: LatLng): Promise<TimeAndDistanceValues | ErrorResponse>;
    getNearbyTripRequest(driverPosition: LatLng): Promise<ClientRequestResponse[] | ErrorResponse>;
    updateDriverAssigned(idClientRequest: number, idDriver: number, fareAssigned: number): Promise<boolean | ErrorResponse>;
    getClientRequestById(idClientRequest: number): Promise<ClientRequestResponse | ErrorResponse>;
    updateStatus(idClientRequest: number, status: Status): Promise<boolean | ErrorResponse>;
    updateDriverRating(idClientRequest: number, rating: number): Promise<boolean | ErrorResponse>;
    updateClientRating(idClientRequest: number, rating: number): Promise<boolean | ErrorResponse>;
    getByClientAssigned(idClient: number): Promise<ClientRequestResponse[] | ErrorResponse>;
    getByDriverAssigned(idDriver: number): Promise<ClientRequestResponse[] | ErrorResponse>;

}