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
import { GooglePlaceServices } from "../data/sources/remote/services/GooglePlacesService";
import { GooglePlaceRepositoryImpl } from "../data/repository/GooglePlaceRepositoryImpl";
import { GetPlaceDetailsByCoordsUseCase } from "../domain/useCases/GooglePlaces/GetPlaceDetailsByCoordsUseCase";
import { GetPlaceDetailsUseCase } from "../domain/useCases/GooglePlaces/GetPlaceDetailsUseCase";
import { GooglePlaceUseCases } from "../domain/useCases/GooglePlaces/GooglePlacesUseCases";
import { ClientSearchMapViewModel } from "../presentation/screens/client/searchMap/ClientSearchMapViewModel";

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

const googlePlaceService = new GooglePlaceServices();
const googlePlaceRepository = new GooglePlaceRepositoryImpl({ googlePlaceService });
const getPlaceDetailsUseCase = new GetPlaceDetailsUseCase({ googlePlaceRepository });
const getPlaceDetailsByCoordsUseCase = new GetPlaceDetailsByCoordsUseCase({ googlePlaceRepository });
const googlePlaceUseCases = new GooglePlaceUseCases({ getPlaceDetailsUseCase, getPlaceDetailsByCoordsUseCase });
const clientSearchMapViewModel = new ClientSearchMapViewModel({ googlePlaceUseCases });


type ContainerDeps = {
    loginViewModel: LoginViewModel;
    registerViewModel: RegisterViewModel;
    saveAuthSessionUseCase: SaveAuthSessionUseCase;
    getAuthSessionUseCase: GetAuthSessionUseCase;
    removeAuthSessionUseCase: RemoveAuthSessionUseCase;
    authUseCases: AuthUseCases;
    googlePlaceService: GooglePlaceServices;
    googlePlaceRepository: GooglePlaceRepositoryImpl;
    getPlaceDetailsUseCase: GetPlaceDetailsUseCase;
    getPlaceDetailsByCoordsUseCase: GetPlaceDetailsByCoordsUseCase;
    googlePlaceUseCases: GooglePlaceUseCases;
    clientSearchMapViewModel: ClientSearchMapViewModel;
};

const container = {
    resolve<K extends keyof ContainerDeps>(name: K): ContainerDeps[K] {
        const deps: ContainerDeps = {
            loginViewModel,
            registerViewModel,
            saveAuthSessionUseCase,
            getAuthSessionUseCase,
            removeAuthSessionUseCase,
            authUseCases,
            googlePlaceService,
            googlePlaceRepository,
            getPlaceDetailsUseCase,
            getPlaceDetailsByCoordsUseCase,
            googlePlaceUseCases,
            clientSearchMapViewModel
        };
        return deps[name];
    }
};

export { container };