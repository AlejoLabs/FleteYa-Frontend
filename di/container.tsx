import { AuthService } from "../data/sources/remote/services/AuthService";
import { AuthRespositoryImpl } from "../data/repository/AuthRepositoryImpl";
import { LoginUseCase } from "../domain/useCases/auth/LoginUseCase";
import { LoginViewModel } from "../presentation/screens/auth/login/LoginViewModel";

const authService = new AuthService();
const authRepository = new AuthRespositoryImpl({ authService });
const loginUseCase = new LoginUseCase({ authRepository });
const loginViewModel = new LoginViewModel({ loginUseCase });

const container = {
    resolve: (name: 'loginViewModel'): LoginViewModel => {
        const deps: Record<string, unknown> = { loginViewModel };
        return deps[name] as LoginViewModel;
    }
};

export { container };