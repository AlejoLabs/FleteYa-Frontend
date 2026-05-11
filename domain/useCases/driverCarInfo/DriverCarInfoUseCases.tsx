import { CreateDriverCarInfoUseCase } from "./CreateDriverCarInfoUseCase";

export class DriverCarInfoUseCases {
    create: CreateDriverCarInfoUseCase;

    constructor(
        {
            createDriverCarInfoUseCase
        }:
        {
            createDriverCarInfoUseCase: CreateDriverCarInfoUseCase;
        }
    ){
        this.create = createDriverCarInfoUseCase;
    }
}