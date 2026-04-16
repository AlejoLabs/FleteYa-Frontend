import { AuthService } from "../data/sources/remote/services/AuthService";
import { AuthRespositoryImpl } from "../data/repository/AuthRepositoryImpl";
import { LoginUseCase } from "../domain/useCases/auth/LoginUseCase";
import { RegisterUseCase } from "../domain/useCases/auth/RegisterUseCase";
import { LoginViewModel } from "../presentation/screens/auth/login/LoginViewModel";
import { RegisterViewModel } from "../presentation/screens/auth/register/RegisterViewModel";

const authService = new AuthService();
const authRepository = new AuthRespositoryImpl({ authService });
const loginUseCase = new LoginUseCase({ authRepository });
const registerUseCase = new RegisterUseCase({ authRepository });
const loginViewModel = new LoginViewModel({ loginUseCase });
const registerViewModel = new RegisterViewModel({ registerUseCase });

type ContainerDeps = {
    loginViewModel: LoginViewModel;
    registerViewModel: RegisterViewModel;
};

const container = {
    resolve<K extends keyof ContainerDeps>(name: K): ContainerDeps[K] {
        const deps: ContainerDeps = { loginViewModel, registerViewModel };
        return deps[name];
    }
};

export { container };