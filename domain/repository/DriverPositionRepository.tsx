import { DriverPosition } from "../models/DriverPosition";
import { ErrorResponse } from "../models/ErrorResponse";

export interface DriverPositionRepository {

    create(driverPosition: DriverPosition): Promise<boolean | ErrorResponse>;
}