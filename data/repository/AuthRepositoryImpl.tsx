import { AuthResponse } from "../../domain/models/AuthResponse";
import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { User } from "../../domain/models/User";
import { AuthRepository } from "../../domain/repository/AuthRepository";
import { LocalStorage } from "../sources/local/LocalStorage";
import { AuthService } from "../sources/remote/services/AuthService";

export class AuthRespositoryImpl implements AuthRepository{

    private authService: AuthService;
    private localStorage: LocalStorage;

    constructor(
        {
            authService,
            localStorage
        }: 
        {
            authService: AuthService,
            localStorage: LocalStorage
        }
    ){
        this.authService = authService;
        this.localStorage = localStorage;
    }

    async saveAuthSession(authResponse: AuthResponse): Promise<void> {
        await this.localStorage.save("auth", JSON.stringify(authResponse));
    }
    async getAuthSession(): Promise<AuthResponse> {
        const data = await this.localStorage.getItem("auth");
        const authData: AuthResponse = JSON.parse(data as any);
        return authData;
    }
    async removeAuthSession(): Promise<void> {
        await this.localStorage.remove("auth");
    }
    async register(user: User): Promise<AuthResponse | ErrorResponse> {
        return await this.authService.register(user);
    }
    async login(email: string, password: string): Promise<AuthResponse | ErrorResponse>{
        return await this.authService.login(email, password);
    }
}