import { PhotoRepository } from "../../repository/PhotoRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { Photo, TripPhotoKind } from "../../models/Photo";
export class DeleteVehiclePhotoUseCase {
    private photoRepository: PhotoRepository;

    constructor({photoRepository}: {photoRepository: PhotoRepository}){
        this.photoRepository = photoRepository;
    }

    async execute(idPhoto: number): Promise<boolean | ErrorResponse> {
        return await this.photoRepository.deleteVehiclePhoto(idPhoto);
    }
}
