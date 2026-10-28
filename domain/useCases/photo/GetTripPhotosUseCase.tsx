import { PhotoRepository } from "../../repository/PhotoRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { Photo, TripPhotoKind } from "../../models/Photo";
export class GetTripPhotosUseCase {
    private photoRepository: PhotoRepository;

    constructor({photoRepository}: {photoRepository: PhotoRepository}){
        this.photoRepository = photoRepository;
    }

    async execute(idClientRequest: number): Promise<Photo[] | ErrorResponse> {
        return await this.photoRepository.getTripPhotos(idClientRequest);
    }
}
