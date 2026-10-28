import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { User } from "../../../../domain/models/User";
import { ApiRequestHandler } from "../api/ApiRequestHandler";
import mime from 'mime';

export class UserService {

    async update(user: User) {
        try {
            const response = await ApiRequestHandler.put<User>(`/users/upload/${user.id}`, user);

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                console.error('Error response completo', JSON.stringify(error.response.data));
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

    async updateWithImage(user: User, image: string) {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: image,
                name: image.split('/').pop() ?? 'image',
                type: mime.getType(image) ?? 'image/jpeg'
            } as any);
            formData.append('name', user.name);
            formData.append('lastname', user.lastname);
            formData.append('phone', user.phone);
            const response = await ApiRequestHandler.put<User>(`/users/upload/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const errorData: ErrorResponse = error.response.data;
                console.error('Error response completo updateWithImage', JSON.stringify(error.response.data));
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

}