import { UploadTripPhotoUseCase } from "./UploadTripPhotoUseCase";
import { GetTripPhotosUseCase } from "./GetTripPhotosUseCase";
import { DeleteTripPhotoUseCase } from "./DeleteTripPhotoUseCase";
import { UploadVehiclePhotoUseCase } from "./UploadVehiclePhotoUseCase";
import { GetVehiclePhotosUseCase } from "./GetVehiclePhotosUseCase";
import { DeleteVehiclePhotoUseCase } from "./DeleteVehiclePhotoUseCase";

export class PhotoUseCases {
    uploadTripPhoto: UploadTripPhotoUseCase;
    getTripPhotos: GetTripPhotosUseCase;
    deleteTripPhoto: DeleteTripPhotoUseCase;
    uploadVehiclePhoto: UploadVehiclePhotoUseCase;
    getVehiclePhotos: GetVehiclePhotosUseCase;
    deleteVehiclePhoto: DeleteVehiclePhotoUseCase;

    constructor(
        {
            uploadTripPhotoUseCase,
            getTripPhotosUseCase,
            deleteTripPhotoUseCase,
            uploadVehiclePhotoUseCase,
            getVehiclePhotosUseCase,
            deleteVehiclePhotoUseCase
        }:
        {
            uploadTripPhotoUseCase: UploadTripPhotoUseCase;
            getTripPhotosUseCase: GetTripPhotosUseCase;
            deleteTripPhotoUseCase: DeleteTripPhotoUseCase;
            uploadVehiclePhotoUseCase: UploadVehiclePhotoUseCase;
            getVehiclePhotosUseCase: GetVehiclePhotosUseCase;
            deleteVehiclePhotoUseCase: DeleteVehiclePhotoUseCase;
        }
    ){
        this.uploadTripPhoto = uploadTripPhotoUseCase;
        this.getTripPhotos = getTripPhotosUseCase;
        this.deleteTripPhoto = deleteTripPhotoUseCase;
        this.uploadVehiclePhoto = uploadVehiclePhotoUseCase;
        this.getVehiclePhotos = getVehiclePhotosUseCase;
        this.deleteVehiclePhoto = deleteVehiclePhotoUseCase;
    }
}
