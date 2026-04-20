import { AuthResponse } from "../../models/AuthResponse";
import { AuthRepository } from "../../repository/AuthRepository";

export class GetAuthSessionUseCase {

    private authRepository: AuthRepository;
    constructor({authRepository}: {authRepository: AuthRepository}){
        this.authRepository = authRepository;
    }

    async execute(): Promise<AuthResponse>{
        return await this.authRepository.getAuthSession();
    }
}