import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { Photo, TripPhotoKind } from "../../../../domain/models/Photo";

// Subir y listar fotos del flete y del vehículo. Las fotos ya llegan comprimidas desde PhotoPicker
export class PhotoService {

    private toErrorResponse(error: any): ErrorResponse {
        if (error.response) {
            console.log('Error del servidor', error.response.data?.message);
            return error.response.data;
        }
        console.log('Error en la peticion', error.message);
        return defaultErrorResponse;
    }

    private photoForm(uri: string, fields: Record<string, string> = {}) {
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
        formData.append('file', { uri, name: 'foto.jpg', type: 'image/jpeg' } as any);
        return formData;
    }

    async uploadTripPhoto(idClientRequest: number, kind: TripPhotoKind, uri: string): Promise<Photo | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<Photo>(`/client-requests/${idClientRequest}/photos`, this.photoForm(uri, { kind }), {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000,
            });
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async getTripPhotos(idClientRequest: number): Promise<Photo[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<Photo[]>(`/client-requests/${idClientRequest}/photos`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async deleteTripPhoto(photo: Photo): Promise<boolean | ErrorResponse> {
        try {
            await ApiRequestHandler.delete(photo.url);
            return true;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async uploadVehiclePhoto(uri: string, token?: string): Promise<Photo | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<Photo>('/driver-car-info/me/photos', this.photoForm(uri), {
                headers: { 'Content-Type': 'multipart/form-data', ...(token ? { Authorization: token } : {}) },
                timeout: 30000,
            });
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async getVehiclePhotos(idDriver: number): Promise<Photo[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<Photo[]>(`/driver-car-info/${idDriver}/photos`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async deleteVehiclePhoto(idPhoto: number): Promise<boolean | ErrorResponse> {
        try {
            await ApiRequestHandler.delete(`/driver-car-info/me/photos/${idPhoto}`);
            return true;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }
}
