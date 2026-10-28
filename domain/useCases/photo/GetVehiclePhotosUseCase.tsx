import { PhotoRepository } from "../../repository/PhotoRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { Photo, TripPhotoKind } from "../../models/Photo";
export class GetVehiclePhotosUseCase {
    private photoRepository: PhotoRepository;

    constructor({photoRepository}: {photoRepository: PhotoRepository}){
        this.photoRepository = photoRepository;
    }

    async execute(idDriver: number): Promise<Photo[] | ErrorResponse> {
        return await this.photoRepository.getVehiclePhotos(idDriver);
    }
}
