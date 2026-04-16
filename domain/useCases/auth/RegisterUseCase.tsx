import { AuthResponse } from "../../models/AuthResponse";
import { ErrorResponse } from "../../models/ErrorResponse";
import { User } from "../../models/User";
import { AuthRepository } from "../../repository/AuthRepository";

export class RegisterUseCase {

    private authRepository: AuthRepository;

    constructor({authRepository}: {authRepository: AuthRepository}){
        this.authRepository = authRepository;
    }

    async execute(user: User): Promise<AuthResponse | ErrorResponse>{
        return await this.authRepository.register(user);
    }
}