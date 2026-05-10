import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../models/TimeAndDistanceValues";
import { ErrorResponse } from "../models/ErrorResponse";
import { ClientRequest } from "../models/ClientRequest";
import { ClientRequestResponse } from "../models/ClientRequestResponse";

export interface ClientRequestRepository {

    create(clientRequest: ClientRequest): Promise<number | ErrorResponse>;
    getTimeAndDistance(origin:LatLng, destination: LatLng): Promise<TimeAndDistanceValues | ErrorResponse>;
    getNearbyTripRequest(driverPosition: LatLng): Promise<ClientRequestResponse[] | ErrorResponse>;
    updateDriverAssigned(idClientRequest: number, idDriver: number, fareAssigned: number): Promise<boolean | ErrorResponse>;
     getClientRequestById(idClientRequest: number): Promise<ClientRequestResponse | ErrorResponse>;
}