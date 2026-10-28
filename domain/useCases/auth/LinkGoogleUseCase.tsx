import { AuthResponse } from "../../models/AuthResponse";
import { ErrorResponse } from "../../models/ErrorResponse";
import { AuthRepository } from "../../repository/AuthRepository";

export class LinkGoogleUseCase {

    private authRepository: AuthRepository;

    constructor({authRepository}: {authRepository: AuthRepository}){
        this.authRepository = authRepository;
    }

    async execute(idToken: string, password: string): Promise<AuthResponse | ErrorResponse>{
        return await this.authRepository.linkGoogle(idToken, password);
    }
}
