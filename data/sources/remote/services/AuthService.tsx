import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { defaultErrorResponse, ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { DriverVehicle } from "../../../../domain/models/DriverVehicle";
import { MessageResponse } from "../../../../domain/models/MessageResponse";
import { User } from "../../../../domain/models/User";
import { ApiRequestHandler } from "../api/ApiRequestHandler";
import { currentLanguage } from "../../../../i18n";

export class AuthService {

  // Mismo manejo de errores que login y register: devuelve el mensaje del servidor para mostrarlo en la app
  private toErrorResponse(error: any): ErrorResponse {
    if (error.response) {
      console.log('Error del servidor', error.response.data?.message);
      return error.response.data;
    }
    console.log('Error en la peticion', error.message);
    return defaultErrorResponse;
  }

  async registerDriver(user: User, vehicle: DriverVehicle): Promise<AuthResponse | ErrorResponse> {
    try {
      const response = await ApiRequestHandler.post<AuthResponse>('/auth/register-driver', { ...user, vehicle, language: currentLanguage() });
      return response.data;
    } catch (error: any) {
      return this.toErrorResponse(error);
    }
  }

  async forgotPassword(email: string): Promise<MessageResponse | ErrorResponse> {
    try {
      const response = await ApiRequestHandler.post<MessageResponse>('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return this.toErrorResponse(error);
    }
  }

  // El backend valida el token de Google; si el correo ya tiene cuenta con contraseña responde 409 con code LINK_REQUIRED
  async loginWithGoogle(idToken: string): Promise<AuthResponse | ErrorResponse> {
    try {
      const response = await ApiRequestHandler.post<AuthResponse>('/auth/google', { id_token: idToken, language: currentLanguage() });
      return response.data;
    } catch (error: any) {
      return this.toErrorResponse(error);
    }
  }

  async linkGoogle(idToken: string, password: string): Promise<AuthResponse | ErrorResponse> {
    try {
      const response = await ApiRequestHandler.post<AuthResponse>('/auth/google/link', { id_token: idToken, password });
      return response.data;
    } catch (error: any) {
      return this.toErrorResponse(error);
    }
  }

  // Con la sesión abierta (el token lo agrega ApiRequestHandler). Las cuentas de Google sin contraseña no mandan la actual
  async changePassword(currentPassword: string | undefined, newPassword: string): Promise<MessageResponse | ErrorResponse> {
    try {
      const response = await ApiRequestHandler.put<MessageResponse>('/auth/password', { current_password: currentPassword, new_password: newPassword });
      return response.data;
    } catch (error: any) {
      return this.toErrorResponse(error);
    }
  }

  async resetPassword(email: string, code: string, password: string): Promise<MessageResponse | ErrorResponse> {
    try {
      const response = await ApiRequestHandler.post<MessageResponse>('/auth/reset-password', { email, code, password });
      return response.data;
    } catch (error: any) {
      return this.toErrorResponse(error);
    }
  }

    async login (email: string, password: string): Promise<AuthResponse | ErrorResponse>{
    try {
      const response = await ApiRequestHandler.post<AuthResponse>('/auth/login', {
        email: email,
        password: password
      });

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
      else{
        console.log('Error en la peticion', error.message);
        return defaultErrorResponse;
      }

    }
  }

  async register(user: User): Promise<AuthResponse | ErrorResponse>{
    try {
      const response = await ApiRequestHandler.post<AuthResponse>('/auth/register', { ...user, language: currentLanguage() });

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
      else{
        console.log('Error en la peticion', error.message);
        return defaultErrorResponse;
      }

    }
  }
}