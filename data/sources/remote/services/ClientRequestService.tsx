import { LatLng } from "react-native-maps";
import { TimeAndDistanceValues } from "../../../../domain/models/TimeAndDistanceValues";
import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { ClientRequest } from "../../../../domain/models/ClientRequest";
import { ActiveTrip, ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { Status } from "../../../../domain/repository/ClientRequestRepository";

export class ClientRequestService {

    // Mismo manejo de errores que el resto de métodos: devuelve el mensaje del servidor para mostrarlo en la app
    private toErrorResponse(error: any): ErrorResponse {
        if (error.response) {
            console.log('Error del servidor', error.response.data?.message);
            return error.response.data;
        }
        console.log('Error en la peticion', error.message);
        return defaultErrorResponse;
    }

    async raiseFare(idClientRequest: number, fare: number): Promise<boolean | ErrorResponse> {
        try {
            await ApiRequestHandler.put(`/client-requests/${idClientRequest}/fare`, { fare_offered: fare });
            return true;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async cancel(idClientRequest: number, reason: string): Promise<boolean | ErrorResponse> {
        try {
            await ApiRequestHandler.put(`/client-requests/${idClientRequest}/cancel`, { reason });
            return true;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async dismiss(idClientRequest: number): Promise<boolean | ErrorResponse> {
        try {
            await ApiRequestHandler.post(`/client-requests/${idClientRequest}/dismiss`, {});
            return true;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async deliver(idClientRequest: number, code: string): Promise<boolean | ErrorResponse> {
        try {
            await ApiRequestHandler.post(`/client-requests/${idClientRequest}/deliver`, { code });
            return true;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async confirmDelivery(idClientRequest: number): Promise<boolean | ErrorResponse> {
        try {
            await ApiRequestHandler.put(`/client-requests/${idClientRequest}/confirm-delivery`, {});
            return true;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

    async getMyActiveTrips(): Promise<ActiveTrip[] | ErrorResponse> {
        try {
            const response = await ApiRequestHandler.get<ActiveTrip[]>(`/client-requests/me/active`);
            return response.data;
        } catch (error: any) {
            return this.toErrorResponse(error);
        }
    }

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
