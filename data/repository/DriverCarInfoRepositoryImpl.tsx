import { DriverCarInfo } from "../../domain/models/DriverCarInfo";
import { ErrorResponse } from "../../domain/models/ErrorResponse";
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
    async create(driverCarInfo: DriverCarInfo): Promise<DriverCarInfo | ErrorResponse> {
        return await this.driverCarInfoService.create(driverCarInfo);
    }

}