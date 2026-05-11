import { Driver } from "../../../../domain/models/ClientRequestResponse";
import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";

export class DriverCarInfoViewModel {
    private driverCarInfoUseCases: DriverCarInfoUseCases;

    constructor(
        {
            driverCarInfoUseCases
        }: 
        {
            driverCarInfoUseCases: DriverCarInfoUseCases
        }
    ){
        this.driverCarInfoUseCases = driverCarInfoUseCases;
    }

    async createDriverCarInfo(driverCarInfo: DriverCarInfo){
        return await this.driverCarInfoUseCases.create.execute(driverCarInfo);
    }
}