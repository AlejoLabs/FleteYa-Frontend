import { AuthResponse } from "../models/AuthResponse";
import { ErrorResponse } from "../models/ErrorResponse";
import { User } from "../models/User";
import { DriverVehicle } from "../models/DriverVehicle";
import { MessageResponse } from "../models/MessageResponse";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthResponse | ErrorResponse>;
  register(user: User): Promise<AuthResponse | ErrorResponse>;
  registerDriver(user: User, vehicle: DriverVehicle): Promise<AuthResponse | ErrorResponse>;
  forgotPassword(email: string): Promise<MessageResponse | ErrorResponse>;
  resetPassword(email: string, code: string, password: string): Promise<MessageResponse | ErrorResponse>;
  changePassword(currentPassword: string | undefined, newPassword: string): Promise<MessageResponse | ErrorResponse>;
  loginWithGoogle(idToken: string): Promise<AuthResponse | ErrorResponse>;
  linkGoogle(idToken: string, password: string): Promise<AuthResponse | ErrorResponse>;
  saveAuthSession(authResponse: AuthResponse): Promise<void>;
  getAuthSession(): Promise<AuthResponse>;
  removeAuthSession(): Promise<void>;
}
