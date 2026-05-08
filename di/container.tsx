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
import { GetDirectionsUseCase } from "../domain/useCases/GooglePlaces/GetDirectionsUseCase";
import { GetPlaceDetailsByCoordsUseCase } from "../domain/useCases/GooglePlaces/GetPlaceDetailsByCoordsUseCase";
import { GetPlaceDetailsUseCase } from "../domain/useCases/GooglePlaces/GetPlaceDetailsUseCase";
import { GooglePlaceUseCases } from "../domain/useCases/GooglePlaces/GooglePlacesUseCases";
import { ClientSearchMapViewModel } from "../presentation/screens/client/searchMap/ClientSearchMapViewModel";
import { ClientRequestService } from "../data/sources/remote/services/ClientRequestService";
import { ClientRequestRepositoryImpl } from "../data/repository/ClientRequestRepositoryImpl";
import { GetTimeAndDistanceUseCase } from "../domain/useCases/clientRequest/GetTimeAndDistanceUseCase";
import { CreateClientRequestUseCase } from "../domain/useCases/clientRequest/CreateClientRequestUseCase";
import { GetNearbyTripRequestUseCase } from "../domain/useCases/clientRequest/GetNearbyTripRequestUseCase";
import { ClientRequestUseCases } from "../domain/useCases/clientRequest/ClientRequestUseCases";
import { SocketService } from "../data/sources/remote/services/SocketService";
import { DriverMyLocationMapViewModel } from "../presentation/screens/driver/MyLocationMap/DriverMyLocationMapViewModel";
import { DriverClientRequestViewModel } from "../presentation/screens/driver/clientRequest/DriverClientRequestViewModel";
import { ProfileUpdateViewModel } from "../presentation/screens/profile/update/ProfileUpdateViewModel";
import { UserService } from "../data/sources/remote/services/UserService";
import { DriverPositionService } from "../data/sources/remote/services/DriverPositionService";
import { DriverPositionRepositoryImpl } from "../data/repository/DriverPositionRepositoryImpl";
import { CreateDriverPositionUseCase } from "../domain/useCases/driverPosition/CreateDriverPositionUseCase";
import { GetDriverPositionUseCase } from "../domain/useCases/driverPosition/GetDriverPositionUseCase";
import { DriverPositionUseCases } from "../domain/useCases/driverPosition/DriverPositionUseCases";
import { UserRepositoryImpl } from "../data/repository/UserRepositoryImpl";
import { UpdateUserUseCase } from "../domain/useCases/user/UpdateUserUseCase";
import { UpdateImageUserUseCase } from "../domain/useCases/user/UpdateImageUserUseCase";
import { UserUseCases } from "../domain/useCases/user/UserUseCases";
import { DriverTripOfferService } from "../data/sources/remote/services/DriverTripOfferService";
import { DriverTripOfferRepositoryImpl } from "../data/repository/DriverTripOfferRepositoryImpl";
import { CreateDriverTripOfferUseCase } from "../domain/useCases/driverTripOffer/CreateDriverTripOfferUseCase";
import { DriverTripOfferUseCases } from "../domain/useCases/driverTripOffer/DriverTripOfferUseCases";

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
const getDirectionsUseCase = new GetDirectionsUseCase({ googlePlaceRepository });
const getPlaceDetailsUseCase = new GetPlaceDetailsUseCase({ googlePlaceRepository });
const getPlaceDetailsByCoordsUseCase = new GetPlaceDetailsByCoordsUseCase({ googlePlaceRepository });
const googlePlaceUseCases = new GooglePlaceUseCases({ getPlaceDetailsUseCase, getPlaceDetailsByCoordsUseCase, getDirectionsUseCase });
const clientRequestService = new ClientRequestService();
const clientRequestRepository = new ClientRequestRepositoryImpl({ clientRequestService });
const getTimeAndDistanceUseCase = new GetTimeAndDistanceUseCase({ clientRequestRepository });
const createClientRequestUseCase = new CreateClientRequestUseCase({ clientRequestRepository });
const getNearbyTripRequestUseCase = new GetNearbyTripRequestUseCase({ clientRequestRepository });
const clientRequestUseCases = new ClientRequestUseCases({ getTimeAndDistanceUseCase, getNearbyTripRequestUseCase, createClientRequestUseCase });
const socketService = new SocketService({} as any);
const clientSearchMapViewModel = new ClientSearchMapViewModel({ googlePlaceUseCases, clientRequestUseCases, socketService });
const driverPositionService = new DriverPositionService();
const driverPositionRepository = new DriverPositionRepositoryImpl({ driverPositionService });
const createDriverPositionUseCase = new CreateDriverPositionUseCase({ driverPositionRepository });
const getDriverPositionUseCase = new GetDriverPositionUseCase({ driverPositionRepository });
const driverPositionUseCases = new DriverPositionUseCases({ createDriverPositionUseCase, getDriverPositionUseCase });
const userService = new UserService();
const driverMyLocationMapViewModel = new DriverMyLocationMapViewModel({ googlePlaceUseCases, clientRequestUseCases, socketService, driverPositionUseCases });
const userRepository = new UserRepositoryImpl(userService);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const updateImageUserUseCase = new UpdateImageUserUseCase(userRepository);
const userUseCases = new UserUseCases({ updateUserUseCase, updateImageUserUseCase });
const profileUpdateViewModel = new ProfileUpdateViewModel(userUseCases);
const driverTripOfferService = new DriverTripOfferService();
const driverTripOfferRepository = new DriverTripOfferRepositoryImpl({ driverTripOfferService });
const createDriverTripOfferUseCase = new CreateDriverTripOfferUseCase({ driverTripOfferRepository });
const driverTripOfferUseCases = new DriverTripOfferUseCases({createDriverTripOfferUseCase});
const driverClientRequestViewModel = new DriverClientRequestViewModel({ clientRequestUseCases, driverPositionUseCases, driverTripOfferUseCases });


type ContainerDeps = {
    loginViewModel: LoginViewModel;
    registerViewModel: RegisterViewModel;
    saveAuthSessionUseCase: SaveAuthSessionUseCase;
    getAuthSessionUseCase: GetAuthSessionUseCase;
    removeAuthSessionUseCase: RemoveAuthSessionUseCase;
    authUseCases: AuthUseCases;
    googlePlaceService: GooglePlaceServices;
    googlePlaceRepository: GooglePlaceRepositoryImpl;
    getDirectionsUseCase: GetDirectionsUseCase;
    getPlaceDetailsUseCase: GetPlaceDetailsUseCase;
    getPlaceDetailsByCoordsUseCase: GetPlaceDetailsByCoordsUseCase;
    googlePlaceUseCases: GooglePlaceUseCases;
    clientSearchMapViewModel: ClientSearchMapViewModel;
    clientRequestService: ClientRequestService;
    clientRequestRepository: ClientRequestRepositoryImpl;
    getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
    getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
    createClientRequestUseCase: CreateClientRequestUseCase;
    clientRequestUseCases: ClientRequestUseCases;
    socketService: SocketService;
    driverMyLocationMapViewModel: DriverMyLocationMapViewModel;
    driverClientRequestViewModel: DriverClientRequestViewModel;
    profileUpdateViewModel: ProfileUpdateViewModel;
    userService: UserService;
    driverPositionService: DriverPositionService;
    driverPositionRepository: DriverPositionRepositoryImpl;
    driverPositionRespository: DriverPositionRepositoryImpl;
    createDriverPositionUseCase: CreateDriverPositionUseCase;
    getDriverPositionUseCase: GetDriverPositionUseCase;
    driverPositionUseCases: DriverPositionUseCases;
    userRepository: UserRepositoryImpl;
    updateUserUseCase: UpdateUserUseCase;
    updateImageUserUseCase: UpdateImageUserUseCase;
    userUseCases: UserUseCases;
    driverTripOfferService: DriverTripOfferService;
    driverTripOfferRepository: DriverTripOfferRepositoryImpl;
    createDriverTripOfferUseCase: CreateDriverTripOfferUseCase;
    driverTripOfferUseCases: DriverTripOfferUseCases;
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
            getDirectionsUseCase,
            getPlaceDetailsUseCase,
            getPlaceDetailsByCoordsUseCase,
            googlePlaceUseCases,
            clientSearchMapViewModel,
            clientRequestService,
            clientRequestRepository,
            getTimeAndDistanceUseCase,
            getNearbyTripRequestUseCase,
            createClientRequestUseCase,
            clientRequestUseCases,
            socketService,
            driverMyLocationMapViewModel,
            driverClientRequestViewModel,
            userService,
            driverPositionService,
            driverPositionRepository,
            driverPositionRespository: driverPositionRepository,
            createDriverPositionUseCase,
            getDriverPositionUseCase,
            driverPositionUseCases,
            userRepository,
            updateUserUseCase,
            updateImageUserUseCase,
            userUseCases,
            profileUpdateViewModel,
            driverTripOfferService,
            driverTripOfferRepository,
            createDriverTripOfferUseCase,
            driverTripOfferUseCases
        };
        return deps[name];
    }
};

export { container };