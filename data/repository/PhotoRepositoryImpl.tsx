import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { Photo, TripPhotoKind } from "../../domain/models/Photo";
import { PhotoRepository } from "../../domain/repository/PhotoRepository";
import { PhotoService } from "../sources/remote/services/PhotoService";

export class PhotoRepositoryImpl implements PhotoRepository {

    private photoService: PhotoService;

    constructor({ photoService }: { photoService: PhotoService }) {
        this.photoService = photoService;
    }

    async uploadTripPhoto(idClientRequest: number, kind: TripPhotoKind, uri: string): Promise<Photo | ErrorResponse> {
        return await this.photoService.uploadTripPhoto(idClientRequest, kind, uri);
    }
    async getTripPhotos(idClientRequest: number): Promise<Photo[] | ErrorResponse> {
        return await this.photoService.getTripPhotos(idClientRequest);
    }
    async deleteTripPhoto(photo: Photo): Promise<boolean | ErrorResponse> {
        return await this.photoService.deleteTripPhoto(photo);
    }
    async uploadVehiclePhoto(uri: string, token?: string): Promise<Photo | ErrorResponse> {
        return await this.photoService.uploadVehiclePhoto(uri, token);
    }
    async getVehiclePhotos(idDriver: number): Promise<Photo[] | ErrorResponse> {
        return await this.photoService.getVehiclePhotos(idDriver);
    }
    async deleteVehiclePhoto(idPhoto: number): Promise<boolean | ErrorResponse> {
        return await this.photoService.deleteVehiclePhoto(idPhoto);
    }
}
