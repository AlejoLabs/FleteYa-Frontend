import { CreateDriverCarInfoUseCase } from "./CreateDriverCarInfoUseCase";
import { GetDriverCarInfoUseCase } from "./GetDriverCarInfoUseCase";
import { GetMyDocumentsUseCase } from "./GetMyDocumentsUseCase";

export class DriverCarInfoUseCases {
    create: CreateDriverCarInfoUseCase;
    getDriverCarInfo: GetDriverCarInfoUseCase;
    getMyDocuments: GetMyDocumentsUseCase;

    constructor(
        {
            createDriverCarInfoUseCase,
            getDriverCarInfoUseCase,
            getMyDocumentsUseCase
        }:
        {
            createDriverCarInfoUseCase: CreateDriverCarInfoUseCase;
            getDriverCarInfoUseCase: GetDriverCarInfoUseCase;
            getMyDocumentsUseCase: GetMyDocumentsUseCase;
        }
    ){
        this.create = createDriverCarInfoUseCase;
        this.getDriverCarInfo = getDriverCarInfoUseCase;
        this.getMyDocuments = getMyDocumentsUseCase;
    }
}