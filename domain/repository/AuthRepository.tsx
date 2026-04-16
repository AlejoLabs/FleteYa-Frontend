import { AuthResponse } from "../models/AuthResponse";
import { ErrorResponse } from "../models/ErrorResponse";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthResponse | ErrorResponse>;
}