import { DriverPosition } from "../../models/DriverPosition";
import { ErrorResponse } from "../../models/ErrorResponse";
import { DriverPositionRepository } from "../../repository/DriverPositionRepository";

export class GetDriverPositionUseCase {
    private driverPositionRepository: DriverPositionRepository;

    constructor({ driverPositionRepository }: { driverPositionRepository: DriverPositionRepository }) {
        this.driverPositionRepository = driverPositionRepository;
    }

    async execute(idDriver: number): Promise<DriverPosition | ErrorResponse> {
        return await this.driverPositionRepository.getDriverPosition(idDriver);
    }
}