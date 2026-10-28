import { DriverCarInfoRepository } from "../../repository/DriverCarInfoRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { DriverDocument } from "../../models/DriverDocument";
export class GetMyDocumentsUseCase {
    private driverCarInfoRepository: DriverCarInfoRepository;

    constructor({driverCarInfoRepository}: {driverCarInfoRepository: DriverCarInfoRepository}){
        this.driverCarInfoRepository = driverCarInfoRepository;
    }

    async execute(): Promise<DriverDocument[] | ErrorResponse> {
        return await this.driverCarInfoRepository.getMyDocuments();
    }
}
