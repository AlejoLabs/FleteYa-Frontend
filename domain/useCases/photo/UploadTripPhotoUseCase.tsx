import { PhotoRepository } from "../../repository/PhotoRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { Photo, TripPhotoKind } from "../../models/Photo";
export class UploadTripPhotoUseCase {
    private photoRepository: PhotoRepository;

    constructor({photoRepository}: {photoRepository: PhotoRepository}){
        this.photoRepository = photoRepository;
    }

    async execute(idClientRequest: number, kind: TripPhotoKind, uri: string): Promise<Photo | ErrorResponse> {
        return await this.photoRepository.uploadTripPhoto(idClientRequest, kind, uri);
    }
}
