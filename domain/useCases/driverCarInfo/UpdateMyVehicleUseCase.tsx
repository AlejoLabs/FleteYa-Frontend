import { DriverCarInfoRepository } from "../../repository/DriverCarInfoRepository";
import { DriverVehicleUpdate } from "../../models/DriverCarInfo";

export class UpdateMyVehicleUseCase {
    private driverCarInfoRepository: DriverCarInfoRepository;

    constructor({driverCarInfoRepository}: {driverCarInfoRepository: DriverCarInfoRepository}){
        this.driverCarInfoRepository = driverCarInfoRepository;
    }

    async execute(vehicle: DriverVehicleUpdate) {
        return await this.driverCarInfoRepository.updateMyVehicle(vehicle);
    }
}
