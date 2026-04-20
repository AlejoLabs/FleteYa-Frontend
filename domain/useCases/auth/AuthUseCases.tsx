import { GetAuthSessionUseCase } from "./GetAuthSessionUseCase";
import { LoginUseCase } from "./LoginUseCase";
import { RegisterUseCase } from "./RegisterUseCase";
import { RemoveAuthSessionUseCase } from "./RemoveAuthSessionUseCase";
import { SaveAuthSessionUseCase } from "./SaveAuthSessionUseCase";

export class AuthUseCases {
    
    login: LoginUseCase;
    register: RegisterUseCase;
    saveAuthSession: SaveAuthSessionUseCase;
    getAuthSession: GetAuthSessionUseCase;
    removeAuthSession: RemoveAuthSessionUseCase;

    constructor({
        loginUseCase,
        registerUseCase,
        saveAuthSessionUseCase,
        getAuthSessionUseCase,
        removeAuthSessionUseCase
    }: {
        loginUseCase: LoginUseCase,
        registerUseCase: RegisterUseCase,
        saveAuthSessionUseCase: SaveAuthSessionUseCase,
        getAuthSessionUseCase: GetAuthSessionUseCase,
        removeAuthSessionUseCase: RemoveAuthSessionUseCase
    }) {
        this.login = loginUseCase;
        this.register = registerUseCase;
        this.saveAuthSession = saveAuthSessionUseCase;
        this.getAuthSession = getAuthSessionUseCase;
        this.removeAuthSession = removeAuthSessionUseCase;
    }
}