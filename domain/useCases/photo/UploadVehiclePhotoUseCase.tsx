import { PhotoRepository } from "../../repository/PhotoRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { Photo, TripPhotoKind } from "../../models/Photo";
export class UploadVehiclePhotoUseCase {
    private photoRepository: PhotoRepository;

    constructor({photoRepository}: {photoRepository: PhotoRepository}){
        this.photoRepository = photoRepository;
    }

    async execute(uri: string, token?: string): Promise<Photo | ErrorResponse> {
        return await this.photoRepository.uploadVehiclePhoto(uri, token);
    }
}
