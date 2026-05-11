import { CreateDriverCarInfoUseCase } from "./CreateDriverCarInfoUseCase";
import { GetDriverCarInfoUseCase } from "./GetDriverCarInfoUseCase";

export class DriverCarInfoUseCases {
    create: CreateDriverCarInfoUseCase;
    getDriverCarInfo: GetDriverCarInfoUseCase;

    constructor(
        {
            createDriverCarInfoUseCase,
            getDriverCarInfoUseCase
        }:
        {
            createDriverCarInfoUseCase: CreateDriverCarInfoUseCase;
            getDriverCarInfoUseCase: GetDriverCarInfoUseCase;
        }
    ){
        this.create = createDriverCarInfoUseCase;
        this.getDriverCarInfo = getDriverCarInfoUseCase;
    }
}