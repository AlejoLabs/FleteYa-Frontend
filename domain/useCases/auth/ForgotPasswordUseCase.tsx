import { ErrorResponse } from "../../models/ErrorResponse";
import { AuthRepository } from "../../repository/AuthRepository";
import { MessageResponse } from "../../models/MessageResponse";

export class ForgotPasswordUseCase {

    private authRepository: AuthRepository;

    constructor({authRepository}: {authRepository: AuthRepository}){
        this.authRepository = authRepository;
    }

    async execute(email: string): Promise<MessageResponse | ErrorResponse>{
        return await this.authRepository.forgotPassword(email);
    }
}
