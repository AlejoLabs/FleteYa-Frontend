import { PhotoRepository } from "../../repository/PhotoRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { Photo, TripPhotoKind } from "../../models/Photo";
export class DeleteTripPhotoUseCase {
    private photoRepository: PhotoRepository;

    constructor({photoRepository}: {photoRepository: PhotoRepository}){
        this.photoRepository = photoRepository;
    }

    async execute(photo: Photo): Promise<boolean | ErrorResponse> {
        return await this.photoRepository.deleteTripPhoto(photo);
    }
}
