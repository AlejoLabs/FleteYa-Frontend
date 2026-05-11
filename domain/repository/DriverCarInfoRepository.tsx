import { DriverCarInfo } from "../models/DriverCarInfo";
import { ErrorResponse } from "../models/ErrorResponse";

export interface DriverCarInfoRepository {

    create(driverCarInfo: DriverCarInfo): Promise<DriverCarInfo | ErrorResponse>;
    getDriverCarInfo(id_driver: number): Promise<DriverCarInfo | ErrorResponse>;
}