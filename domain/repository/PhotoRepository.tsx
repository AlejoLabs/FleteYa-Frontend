import { ErrorResponse } from "../models/ErrorResponse";
import { Photo, TripPhotoKind } from "../models/Photo";

export interface PhotoRepository {

    uploadTripPhoto(idClientRequest: number, kind: TripPhotoKind, uri: string): Promise<Photo | ErrorResponse>;
    getTripPhotos(idClientRequest: number): Promise<Photo[] | ErrorResponse>;
    deleteTripPhoto(photo: Photo): Promise<boolean | ErrorResponse>;
    // token: al registrarse todavía no hay sesión guardada, así que se manda el de la respuesta del registro
    uploadVehiclePhoto(uri: string, token?: string): Promise<Photo | ErrorResponse>;
    getVehiclePhotos(idDriver: number): Promise<Photo[] | ErrorResponse>;
    deleteVehiclePhoto(idPhoto: number): Promise<boolean | ErrorResponse>;
}
