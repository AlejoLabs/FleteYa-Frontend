import { DriverCarInfoRepository } from "../../repository/DriverCarInfoRepository";

export class GetDriverCarInfoUseCase {
    private driverCarInfoRepository: DriverCarInfoRepository;

    constructor(
        {
            driverCarInfoRepository
        }:
            {
                driverCarInfoRepository: DriverCarInfoRepository
            }
    ) {
        this.driverCarInfoRepository = driverCarInfoRepository;
    }

    async execute(idDriver: number) {
        return await this.driverCarInfoRepository.getDriverCarInfo(idDriver);
    }
}