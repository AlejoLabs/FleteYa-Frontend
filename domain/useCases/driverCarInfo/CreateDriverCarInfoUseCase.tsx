import { Driver } from "../../models/ClientRequestResponse";
import { DriverCarInfo } from "../../models/DriverCarInfo";
import { DriverCarInfoRepository } from "../../repository/DriverCarInfoRepository";

export class CreateDriverCarInfoUseCase {
    private driverCarInfoRepository: DriverCarInfoRepository;

    constructor(
        {
            driverCarInfoRepository
        }:
        {
            driverCarInfoRepository: DriverCarInfoRepository
        }
    ){
        this.driverCarInfoRepository = driverCarInfoRepository;
    }

    async execute(driverCarInfo: DriverCarInfo){
        return await this.driverCarInfoRepository.create(driverCarInfo);
    } 
}