import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../models/TimeAndDistanceValues";
import { ErrorResponse } from "../models/ErrorResponse";

export interface ClientRequestRepository {

    getTimeAndDistance(origin:LatLng, destination: LatLng): Promise<TimeAndDistanceValues | ErrorResponse>;
}