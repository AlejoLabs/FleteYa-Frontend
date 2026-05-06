import { DriverPosition } from "../../models/DriverPosition";
import { ErrorResponse } from "../../models/ErrorResponse";
import { DriverPositionRepository } from "../../repository/DriverPositionRepository";

export class CreateDriverPositionUseCase {
    private driverPositionRepository: DriverPositionRepository;

    constructor({ driverPositionRepository }: { driverPositionRepository: DriverPositionRepository }) {
        this.driverPositionRepository = driverPositionRepository;
    }

    async execute(driverPosition: DriverPosition): Promise<boolean | ErrorResponse> {
        return await this.driverPositionRepository.create(driverPosition);
    }
}