import { CreateDriverPositionUseCase } from "./CreateDriverPositionUseCase";
import { GetDriverPositionUseCase } from "./GetDriverPositionUseCase";

export class DriverPositionUseCases {
    create: CreateDriverPositionUseCase;
    getDriverPosition: GetDriverPositionUseCase;

    constructor(
        {
            createDriverPositionUseCase,
            getDriverPositionUseCase
        }: {
            createDriverPositionUseCase: CreateDriverPositionUseCase;
            getDriverPositionUseCase: GetDriverPositionUseCase;
        }
    ) {
        this.create = createDriverPositionUseCase;
        this.getDriverPosition = getDriverPositionUseCase;
    }
}