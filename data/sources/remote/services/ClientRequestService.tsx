import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";
import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { ClientRequest } from "../../../../domain/models/ClientRequest";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { Status } from "../../../../domain/repository/ClientRequestRepository";

export class ClientRequestService {

    async create(clientRequest: ClientRequest): Promise<number | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.post<number>(`/client-requests`, clientRequest);

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.error('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.error('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.error('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

    async getTimeAndDistance(origin: LatLng, destination: LatLng, weight?: number, size?: number): Promise<TimeAndDistanceValues | ErrorResponse> {
        try {
            const params: string[] = [];
            if (weight !== undefined) params.push(`weight=${weight}`);
            if (size !== undefined) params.push(`size=${size}`);
            const query = params.length > 0 ? `?${params.join('&')}` : '';
            const response = await ApiRequestHandler.get<TimeAndDistanceValues>(`/client-requests/${origin.latitude}/${origin.longitude}/${destination.latitude}/${destination.longitude}${query}`);

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.error('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.error('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.error('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

    async getNearbyTripRequest(driverPosition: LatLng): Promise<ClientRequestResponse[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<ClientRequestResponse[]>(`/client-requests/${driverPosition.latitude}/${driverPosition.longitude}`);

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.error('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.error('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.error('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

    async getByClientAssigned(idClient: number): Promise<ClientRequestResponse[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<ClientRequestResponse[]>(`/client-requests/client/assigned/${idClient}`);

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.error('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.error('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.error('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

    async getByDriverAssigned(idDriver: number): Promise<ClientRequestResponse[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<ClientRequestResponse[]>(`/client-requests/driver/assigned/${idDriver}`);

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.error('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.error('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.error('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

    async getClientRequestById(idClientRequest: number): Promise<ClientRequestResponse | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<ClientRequestResponse>(`/client-requests/${idClientRequest}`);

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.error('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.error('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.error('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

    async updateDriverAssigned(idClientRequest: number, idDriver: number, fareAssigned: number): Promise<boolean | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.put<boolean>(`/client-requests/updateDriverAssigned`, {
                'id': idClientRequest,
                'id_driver_assigned': idDriver,
                'fare_assigned': fareAssigned
            });

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                if (Array.isArray(errorData.message)) {
                    console.error('Errores multiples del servidor', errorData.message.join(', '));
                } else {
                    console.error('Error unico del servidor', errorData.message);
                }
                return errorData;
            }
            else {
                console.error('Error en la peticion', error.message);
                return defaultErrorResponse;
            }

        }
    }

    async updateStatus(idClientRequest: number, status: Status): Promise<boolean | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.put<boolean>(`/client-requests/update_status`, {
                'id': idClientRequest,
                'status': status
            });

            return Boolean(response.data);
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

    async updateDriverRating(idClientRequest: number, rating: number): Promise<boolean | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.put<boolean>(`/client-requests/update_driver_rating`, {
                'id': idClientRequest,
                'driver_rating': rating
            });

            return Boolean(response.data);
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

    async updateClientRating(idClientRequest: number, rating: number): Promise<boolean | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.put<boolean>(`/client-requests/update_client_rating`, {
                'id': idClientRequest,
                'client_rating': rating
            });

            return Boolean(response.data);
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
