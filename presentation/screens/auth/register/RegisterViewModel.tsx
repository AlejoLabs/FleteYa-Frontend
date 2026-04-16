import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { User } from "../../../../domain/models/User";
import { RegisterUseCase } from "../../../../domain/useCases/auth/RegisterUseCase";

export class RegisterViewModel {
    private registerUseCase: RegisterUseCase;

    constructor({registerUseCase}: {registerUseCase: RegisterUseCase}){
        this.registerUseCase = registerUseCase;
    }

    async register(user: User): Promise<AuthResponse | ErrorResponse>{
        return await this.registerUseCase.execute(user);
    }
}