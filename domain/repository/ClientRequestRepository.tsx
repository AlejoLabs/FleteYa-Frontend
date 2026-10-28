import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../models/TimeAndDistanceValues";
import { ErrorResponse } from "../models/ErrorResponse";
import { ClientRequest } from "../models/ClientRequest";
import { ActiveTrip, ClientRequestResponse } from "../models/ClientRequestResponse";

export enum Status {
    CREATED = 'CREATED',
    ACCEPTED = 'ACCEPTED',
    ON_THE_WAY = 'ON_THE_WAY',
    ARRIVED = 'ARRIVED',
    TRAVELING = 'TRAVELING',
    FINISHED = 'FINISHED',
    CANCELED = 'CANCELED',
    EXPIRED = 'EXPIRED'
}

export interface ClientRequestRepository {

    create(clientRequest: ClientRequest): Promise<number | ErrorResponse>;
    getTimeAndDistance(origin: LatLng, destination: LatLng, weight?: number, size?: number): Promise<TimeAndDistanceValues | ErrorResponse>;
    getNearbyTripRequest(driverPosition: LatLng): Promise<ClientRequestResponse[] | ErrorResponse>;
    updateDriverAssigned(idClientRequest: number, idDriver: number, fareAssigned: number): Promise<boolean | ErrorResponse>;
    getClientRequestById(idClientRequest: number): Promise<ClientRequestResponse | ErrorResponse>;
    updateStatus(idClientRequest: number, status: Status): Promise<boolean | ErrorResponse>;
    updateDriverRating(idClientRequest: number, rating: number): Promise<boolean | ErrorResponse>;
    updateClientRating(idClientRequest: number, rating: number): Promise<boolean | ErrorResponse>;
    getByClientAssigned(idClient: number): Promise<ClientRequestResponse[] | ErrorResponse>;
    getByDriverAssigned(idDriver: number): Promise<ClientRequestResponse[] | ErrorResponse>;
    raiseFare(idClientRequest: number, fare: number): Promise<boolean | ErrorResponse>;
    cancel(idClientRequest: number, reason: string): Promise<boolean | ErrorResponse>;
    dismiss(idClientRequest: number): Promise<boolean | ErrorResponse>;
    getMyActiveTrips(): Promise<ActiveTrip[] | ErrorResponse>;

}