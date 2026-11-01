import { DriverCarInfo, DriverDocumentsUpdate, DriverVehicleUpdate } from "../models/DriverCarInfo";
import { ErrorResponse } from "../models/ErrorResponse";
import { DriverDocument } from "../models/DriverDocument";

export interface DriverCarInfoRepository {

    create(driverCarInfo: DriverCarInfo): Promise<DriverCarInfo | ErrorResponse>;
    getDriverCarInfo(id_driver: number): Promise<DriverCarInfo | ErrorResponse>;
    getMyDocuments(): Promise<DriverDocument[] | ErrorResponse>;
    updateMyVehicle(vehicle: DriverVehicleUpdate): Promise<DriverCarInfo | ErrorResponse>;
    updateMyDocuments(documents: DriverDocumentsUpdate): Promise<DriverDocument[] | ErrorResponse>;
}