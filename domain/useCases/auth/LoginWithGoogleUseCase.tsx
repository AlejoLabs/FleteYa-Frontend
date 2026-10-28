import { AuthResponse } from "../../models/AuthResponse";
import { ErrorResponse } from "../../models/ErrorResponse";
import { AuthRepository } from "../../repository/AuthRepository";

export class LoginWithGoogleUseCase {

    private authRepository: AuthRepository;

    constructor({authRepository}: {authRepository: AuthRepository}){
        this.authRepository = authRepository;
    }

    async execute(idToken: string): Promise<AuthResponse | ErrorResponse>{
        return await this.authRepository.loginWithGoogle(idToken);
    }
}
