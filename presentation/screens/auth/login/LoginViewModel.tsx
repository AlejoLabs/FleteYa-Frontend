import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";

export class LoginViewModel {

    private authUseCases: AuthUseCases;

    constructor({authUseCases}: {authUseCases: AuthUseCases}){
        this.authUseCases = authUseCases;
    }
    async login(email: string, password: string): Promise<AuthResponse | ErrorResponse>{
        return await this.authUseCases.login.execute(email, password);
    }

}