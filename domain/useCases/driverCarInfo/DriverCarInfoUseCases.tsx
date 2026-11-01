import { CreateDriverCarInfoUseCase } from "./CreateDriverCarInfoUseCase";
import { GetDriverCarInfoUseCase } from "./GetDriverCarInfoUseCase";
import { GetMyDocumentsUseCase } from "./GetMyDocumentsUseCase";
import { UpdateMyDocumentsUseCase } from "./UpdateMyDocumentsUseCase";
import { UpdateMyVehicleUseCase } from "./UpdateMyVehicleUseCase";

export class DriverCarInfoUseCases {
    create: CreateDriverCarInfoUseCase;
    getDriverCarInfo: GetDriverCarInfoUseCase;
    getMyDocuments: GetMyDocumentsUseCase;
    updateMyVehicle: UpdateMyVehicleUseCase;
    updateMyDocuments: UpdateMyDocumentsUseCase;

    constructor(
        {
            createDriverCarInfoUseCase,
            getDriverCarInfoUseCase,
            getMyDocumentsUseCase,
            updateMyVehicleUseCase,
            updateMyDocumentsUseCase
        }:
        {
            createDriverCarInfoUseCase: CreateDriverCarInfoUseCase;
            getDriverCarInfoUseCase: GetDriverCarInfoUseCase;
            getMyDocumentsUseCase: GetMyDocumentsUseCase;
            updateMyVehicleUseCase: UpdateMyVehicleUseCase;
            updateMyDocumentsUseCase: UpdateMyDocumentsUseCase;
        }
    ){
        this.create = createDriverCarInfoUseCase;
        this.getDriverCarInfo = getDriverCarInfoUseCase;
        this.getMyDocuments = getMyDocumentsUseCase;
        this.updateMyVehicle = updateMyVehicleUseCase;
        this.updateMyDocuments = updateMyDocumentsUseCase;
    }
}