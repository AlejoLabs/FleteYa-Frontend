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

    async forgotPassword(email: string) {
        return await this.authUseCases.forgotPassword.execute(email);
    }

    async resetPassword(email: string, code: string, password: string) {
        return await this.authUseCases.resetPassword.execute(email, code, password);
    }

    async loginWithGoogle(idToken: string) {
        return await this.authUseCases.loginWithGoogle.execute(idToken);
    }

    async linkGoogle(idToken: string, password: string) {
        return await this.authUseCases.linkGoogle.execute(idToken, password);
    }

}