import { AuthService } from "../data/sources/remote/services/AuthService";
import { AuthRespositoryImpl } from "../data/repository/AuthRepositoryImpl";
import { LocalStorage } from "../data/sources/local/LocalStorage";
import { AuthUseCases } from "../domain/useCases/auth/AuthUseCases";
import { GetAuthSessionUseCase } from "../domain/useCases/auth/GetAuthSessionUseCase";
import { LoginUseCase } from "../domain/useCases/auth/LoginUseCase";
import { RemoveAuthSessionUseCase } from "../domain/useCases/auth/RemoveAuthSessionUseCase";
import { RegisterUseCase } from "../domain/useCases/auth/RegisterUseCase";
import { SaveAuthSessionUseCase } from "../domain/useCases/auth/SaveAuthSessionUseCase";
import { LoginViewModel } from "../presentation/screens/auth/login/LoginViewModel";
import { RegisterViewModel } from "../presentation/screens/auth/register/RegisterViewModel";

const authService = new AuthService();
const localStorage = new LocalStorage();
const authRepository = new AuthRespositoryImpl({ authService, localStorage });
const loginUseCase = new LoginUseCase({ authRepository });
const registerUseCase = new RegisterUseCase({ authRepository });
const saveAuthSessionUseCase = new SaveAuthSessionUseCase({ authRepository });
const getAuthSessionUseCase = new GetAuthSessionUseCase({ authRepository });
const removeAuthSessionUseCase = new RemoveAuthSessionUseCase({ authRepository });
const authUseCases = new AuthUseCases({
    loginUseCase,
    registerUseCase,
    saveAuthSessionUseCase,
    getAuthSessionUseCase,
    removeAuthSessionUseCase
});
const loginViewModel = new LoginViewModel({ authUseCases });
const registerViewModel = new RegisterViewModel({ authUseCases });


type ContainerDeps = {
    loginViewModel: LoginViewModel;
    registerViewModel: RegisterViewModel;
    saveAuthSessionUseCase: SaveAuthSessionUseCase;
    getAuthSessionUseCase: GetAuthSessionUseCase;
    removeAuthSessionUseCase: RemoveAuthSessionUseCase;
    authUseCases: AuthUseCases;
};

const container = {
    resolve<K extends keyof ContainerDeps>(name: K): ContainerDeps[K] {
        const deps: ContainerDeps = {
            loginViewModel,
            registerViewModel,
            saveAuthSessionUseCase,
            getAuthSessionUseCase,
            removeAuthSessionUseCase,
            authUseCases
        };
        return deps[name];
    }
};

export { container };