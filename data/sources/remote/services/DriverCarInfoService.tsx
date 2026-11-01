import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";
import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { ClientRequest } from "../../../../domain/models/ClientRequest";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverPosition } from "../../../../domain/models/DriverPosition";
import { DriverCarInfo, DriverDocumentsUpdate, DriverVehicleUpdate } from "../../../../domain/models/DriverCarInfo";
import { DriverDocument } from "../../../../domain/models/DriverDocument";

export class DriverCarInfoService {

    async updateMyVehicle(vehicle: DriverVehicleUpdate): Promise<DriverCarInfo | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.put<DriverCarInfo>('/driver-car-info/me', vehicle);
            return response.data;
        } catch (error: any) {
            if (error.response) return error.response.data;
            console.log('Error en la peticion', error.message);
            return defaultErrorResponse;
        }
    }

    async updateMyDocuments(documents: DriverDocumentsUpdate): Promise<DriverDocument[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.put<DriverDocument[]>('/driver-car-info/me/documents', documents);
            return response.data;
        } catch (error: any) {
            if (error.response) return error.response.data;
            console.log('Error en la peticion', error.message);
            return defaultErrorResponse;
        }
    }

    async create(driverCarInfo: DriverCarInfo): Promise<DriverCarInfo | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<DriverCarInfo>(`/driver-car-info`, driverCarInfo);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.log('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.log('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.log('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

    async getMyDocuments(): Promise<DriverDocument[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<DriverDocument[]>('/driver-car-info/me/documents');
            return response.data;
        } catch (error: any) {
            if (error.response) return error.response.data;
            console.log('Error en la peticion', error.message);
            return defaultErrorResponse;
        }
    }

    async getDriverCarInfo(idDriver: number): Promise<DriverCarInfo | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<DriverCarInfo>(`/driver-car-info/${idDriver}`);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.log('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.log('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.log('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

}
