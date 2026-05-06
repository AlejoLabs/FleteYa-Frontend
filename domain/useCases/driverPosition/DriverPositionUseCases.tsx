import { CreateDriverPositionUseCase } from "./CreateDriverPositionUseCase";

export class DriverPositionUseCases {
    create: CreateDriverPositionUseCase;

    constructor(
        {
            createDriverPositionUseCase
        }: {
            createDriverPositionUseCase: CreateDriverPositionUseCase;
        }
    ) {
        this.create = createDriverPositionUseCase;
    }
}