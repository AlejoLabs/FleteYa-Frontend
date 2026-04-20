import { AuthResponse } from "../models/AuthResponse";
import { ErrorResponse } from "../models/ErrorResponse";
import { User } from "../models/User";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthResponse | ErrorResponse>;
  register(user: User): Promise<AuthResponse | ErrorResponse>;
  saveAuthSession(authResponse: AuthResponse): Promise<void>;
  getAuthSession(): Promise<AuthResponse>;
  removeAuthSession(): Promise<void>;
}