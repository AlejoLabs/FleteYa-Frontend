import { DriverPosition } from "../../domain/models/DriverPosition";
import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { DriverPositionRepository } from "../../domain/repository/DriverPositionRepository";
import { DriverPositionService } from "../sources/remote/services/DriverPositionService";

export class DriverPositionRepositoryImpl implements DriverPositionRepository {

    private driverPositionService: DriverPositionService;

    constructor({ driverPositionService }: { driverPositionService: DriverPositionService }) {
        this.driverPositionService = driverPositionService;
    }
    async getDriverPosition(idDriver: number): Promise<DriverPosition | ErrorResponse> {
        return await this.driverPositionService.getDriverPosition(idDriver);
    }

    async create(driverPosition: DriverPosition): Promise<boolean | ErrorResponse> {
        return await this.driverPositionService.create(driverPosition);
    }

}