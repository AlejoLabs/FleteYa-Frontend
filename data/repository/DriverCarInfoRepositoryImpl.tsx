import { DriverCarInfo, DriverDocumentsUpdate, DriverVehicleUpdate } from "../../domain/models/DriverCarInfo";
import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { DriverDocument } from "../../domain/models/DriverDocument";
import { DriverCarInfoRepository } from "../../domain/repository/DriverCarInfoRepository";
import { DriverCarInfoService } from "../sources/remote/services/DriverCarInfoService";

export class DriverCarInfoRepositoryImpl implements DriverCarInfoRepository {
    
    private driverCarInfoService: DriverCarInfoService;
    
    constructor(
        {
            driverCarInfoService
        }:
        {
            driverCarInfoService: DriverCarInfoService
        }
    ){
        this.driverCarInfoService = driverCarInfoService;
    }
    async getDriverCarInfo(id_driver: number): Promise<DriverCarInfo | ErrorResponse> {
        return await this.driverCarInfoService.getDriverCarInfo(id_driver);
    }
    async getMyDocuments(): Promise<DriverDocument[] | ErrorResponse> {
        return await this.driverCarInfoService.getMyDocuments();
    }
    async create(driverCarInfo: DriverCarInfo): Promise<DriverCarInfo | ErrorResponse> {
        return await this.driverCarInfoService.create(driverCarInfo);
    }
    async updateMyVehicle(vehicle: DriverVehicleUpdate): Promise<DriverCarInfo | ErrorResponse> {
        return await this.driverCarInfoService.updateMyVehicle(vehicle);
    }
    async updateMyDocuments(documents: DriverDocumentsUpdate): Promise<DriverDocument[] | ErrorResponse> {
        return await this.driverCarInfoService.updateMyDocuments(documents);
    }

}