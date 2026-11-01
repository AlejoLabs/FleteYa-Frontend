import { DriverCarInfoRepository } from "../../repository/DriverCarInfoRepository";
import { DriverDocumentsUpdate } from "../../models/DriverCarInfo";

export class UpdateMyDocumentsUseCase {
    private driverCarInfoRepository: DriverCarInfoRepository;

    constructor({driverCarInfoRepository}: {driverCarInfoRepository: DriverCarInfoRepository}){
        this.driverCarInfoRepository = driverCarInfoRepository;
    }

    async execute(documents: DriverDocumentsUpdate) {
        return await this.driverCarInfoRepository.updateMyDocuments(documents);
    }
}
