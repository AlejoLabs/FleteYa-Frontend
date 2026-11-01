import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { Photo, TripPhotoKind } from "../../../../domain/models/Photo";

const RETRY_DELAY_MS = 1500;

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

    // Una subida que se corta en la red (sin respuesta del servidor) se intenta una vez más con un formulario nuevo.
    // Si el servidor respondió con un error, no se repite
    private async postPhoto(url: string, uri: string, fields: Record<string, string> = {}, headers: Record<string, string> = {}) {
        const send = () => ApiRequestHandler.post<Photo>(url, this.photoForm(uri, fields), {
            headers: { 'Content-Type': 'multipart/form-data', ...headers },
            timeout: 30000,
        });
        try {
            return (await send()).data;
        } catch (error: any) {
            if (error.response) throw error;
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            return (await send()).data;
        }
    }

    private photoForm(uri: string, fields: Record<string, string> = {}) {
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
        formData.append('file', { uri, name: 'foto.jpg', type: 'image/jpeg' } as any);
        return formData;
    }

    async uploadTripPhoto(idClientRequest: number, kind: TripPhotoKind, uri: string): Promise<Photo | ErrorResponse> {
        try {
            return await this.postPhoto(`/client-requests/${idClientRequest}/photos`, uri, { kind });
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
            return await this.postPhoto('/driver-car-info/me/photos', uri, {}, token ? { Authorization: token } : {});
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
