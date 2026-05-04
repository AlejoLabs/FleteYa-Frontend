import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../models/TimeAndDistanceValues";
import { ErrorResponse } from "../models/ErrorResponse";
import { ClientRequest } from "../models/ClientRequest";

export interface ClientRequestRepository {

    create(clientRequest: ClientRequest): Promise<number | ErrorResponse>;
    getTimeAndDistance(origin:LatLng, destination: LatLng): Promise<TimeAndDistanceValues | ErrorResponse>;
}