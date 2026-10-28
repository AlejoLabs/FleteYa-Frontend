import { Driver } from "../../../../domain/models/ClientRequestResponse";
import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { DriverCarInfoUseCases } from "../../../../domain/useCases/driverCarInfo/DriverCarInfoUseCases";
import { PhotoUseCases } from "../../../../domain/useCases/photo/PhotoUseCases";

export class DriverCarInfoViewModel {
    private driverCarInfoUseCases: DriverCarInfoUseCases;
    private photoUseCases: PhotoUseCases;

    constructor(
        {
            driverCarInfoUseCases,
            photoUseCases
        }: 
        {
            driverCarInfoUseCases: DriverCarInfoUseCases,
            photoUseCases: PhotoUseCases
        }
    ){
        this.driverCarInfoUseCases = driverCarInfoUseCases;
        this.photoUseCases = photoUseCases;
    }

    async getMyDocuments() {
        return await this.driverCarInfoUseCases.getMyDocuments.execute();
    }

    async getVehiclePhotos(idDriver: number) {
        return await this.photoUseCases.getVehiclePhotos.execute(idDriver);
    }

    async uploadVehiclePhoto(uri: string) {
        return await this.photoUseCases.uploadVehiclePhoto.execute(uri);
    }

    async deleteVehiclePhoto(idPhoto: number) {
        return await this.photoUseCases.deleteVehiclePhoto.execute(idPhoto);
    }

    async createDriverCarInfo(driverCarInfo: DriverCarInfo){
        return await this.driverCarInfoUseCases.create.execute(driverCarInfo);
    }

    async getDriverCarInfo(idDriver: number){
        return await this.driverCarInfoUseCases.getDriverCarInfo.execute(idDriver);
    }
}