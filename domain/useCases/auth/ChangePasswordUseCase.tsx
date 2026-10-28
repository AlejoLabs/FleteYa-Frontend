import { ErrorResponse } from "../../models/ErrorResponse";
import { AuthRepository } from "../../repository/AuthRepository";
import { MessageResponse } from "../../models/MessageResponse";

export class ChangePasswordUseCase {

    private authRepository: AuthRepository;

    constructor({authRepository}: {authRepository: AuthRepository}){
        this.authRepository = authRepository;
    }

    async execute(currentPassword: string | undefined, newPassword: string): Promise<MessageResponse | ErrorResponse>{
        return await this.authRepository.changePassword(currentPassword, newPassword);
    }
}
