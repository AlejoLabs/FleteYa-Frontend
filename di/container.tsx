import { AuthService } from "../data/sources/remote/services/AuthService";
import { AuthRespositoryImpl } from "../data/repository/AuthRepositoryImpl";
import { LocalStorage } from "../data/sources/local/LocalStorage";
import { AuthUseCases } from "../domain/useCases/auth/AuthUseCases";
import { GetAuthSessionUseCase } from "../domain/useCases/auth/GetAuthSessionUseCase";
import { LoginUseCase } from "../domain/useCases/auth/LoginUseCase";
import { RemoveAuthSessionUseCase } from "../domain/useCases/auth/RemoveAuthSessionUseCase";
import { RegisterUseCase } from "../domain/useCases/auth/RegisterUseCase";
import { SaveAuthSessionUseCase } from "../domain/useCases/auth/SaveAuthSessionUseCase";
import { RegisterDriverUseCase } from "../domain/useCases/auth/RegisterDriverUseCase";
import { ForgotPasswordUseCase } from "../domain/useCases/auth/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../domain/useCases/auth/ResetPasswordUseCase";
import { ChangePasswordUseCase } from "../domain/useCases/auth/ChangePasswordUseCase";
import { LoginWithGoogleUseCase } from "../domain/useCases/auth/LoginWithGoogleUseCase";
import { LinkGoogleUseCase } from "../domain/useCases/auth/LinkGoogleUseCase";
import { LoginViewModel } from "../presentation/screens/auth/login/LoginViewModel";
import { RegisterViewModel } from "../presentation/screens/auth/register/RegisterViewModel";
import { ForgotPasswordViewModel } from "../presentation/screens/auth/forgotPassword/ForgotPasswordViewModel";
import { DriverVehicleRegisterViewModel } from "../presentation/screens/auth/driverVehicle/DriverVehicleRegisterViewModel";
import { ChangePasswordViewModel } from "../presentation/screens/profile/changePassword/ChangePasswordViewModel";
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
import { GetClientRequestByIdUseCase } from "../domain/useCases/clientRequest/GetClientRequestByIdUseCase";
import { GetNearbyTripRequestUseCase } from "../domain/useCases/clientRequest/GetNearbyTripRequestUseCase";
import { GetByClientAssignedUseCase } from "../domain/useCases/clientRequest/GetByClientAssignedUseCase";
import { GetByDriverAssignedUseCase } from "../domain/useCases/clientRequest/GetByDriverAssignedUseCase";
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
import { GetDriverTripOfferUseCase } from "../domain/useCases/driverTripOffer/GetDriverTripOfferUseCase";
import { UpdateDriverAssignedUseCase } from "../domain/useCases/clientRequest/UpdateDriverAssignedUseCase";
import { UpdateDriverRatingUseCase } from "../domain/useCases/clientRequest/UpdateDriverRatingUseCase";
import { UpdateClientRatingUseCase } from "../domain/useCases/clientRequest/UpdateClientRatingUseCase";
import { UpdateStatusUseCase } from "../domain/useCases/clientRequest/UpdateStatusUseCase";
import { ClientTripMapViewModel } from "../presentation/screens/client/tripMap/ClientTripMapViewModel";
import { DriverTripMapViewModel } from "../presentation/screens/driver/tripMap/DriverTripMapViewModel";
import { DriverTripRatingViewModel } from "../presentation/screens/driver/tripRating/DriverTripRatingViewModel";
import { ClientTripRatingViewModel } from "../presentation/screens/client/tripRating/ClientTripRatingViewModel";
import { ClientTripHistoryViewModel } from "../presentation/screens/client/tripHistory/ClientTripHistoryViewModel";
import { DriverTripHistoryViewModel } from "../presentation/screens/driver/tripHistory/DriverTripHistoryViewModel";
import { DriverCarInfoService } from "../data/sources/remote/services/DriverCarInfoService";
import { DriverCarInfoRepositoryImpl } from "../data/repository/DriverCarInfoRepositoryImpl";
import { CreateDriverCarInfoUseCase } from "../domain/useCases/driverCarInfo/CreateDriverCarInfoUseCase";
import { GetDriverCarInfoUseCase } from "../domain/useCases/driverCarInfo/GetDriverCarInfoUseCase";
import { DriverCarInfoUseCases } from "../domain/useCases/driverCarInfo/DriverCarInfoUseCases";
import { DriverCarInfoViewModel } from "../presentation/screens/driver/carInfo/DriverCarInfoViewModel";
import { RaiseFareUseCase } from "../domain/useCases/clientRequest/RaiseFareUseCase";
import { CancelClientRequestUseCase } from "../domain/useCases/clientRequest/CancelClientRequestUseCase";
import { DismissClientRequestUseCase } from "../domain/useCases/clientRequest/DismissClientRequestUseCase";
import { DeliverClientRequestUseCase } from "../domain/useCases/clientRequest/DeliverClientRequestUseCase";
import { ConfirmDeliveryUseCase } from "../domain/useCases/clientRequest/ConfirmDeliveryUseCase";
import { GetMyDocumentsUseCase } from "../domain/useCases/driverCarInfo/GetMyDocumentsUseCase";
import { SaveNotificationTokenUseCase } from "../domain/useCases/user/SaveNotificationTokenUseCase";
import { PhotoService } from "../data/sources/remote/services/PhotoService";
import { PhotoRepositoryImpl } from "../data/repository/PhotoRepositoryImpl";
import { UploadTripPhotoUseCase } from "../domain/useCases/photo/UploadTripPhotoUseCase";
import { GetTripPhotosUseCase } from "../domain/useCases/photo/GetTripPhotosUseCase";
import { DeleteTripPhotoUseCase } from "../domain/useCases/photo/DeleteTripPhotoUseCase";
import { UploadVehiclePhotoUseCase } from "../domain/useCases/photo/UploadVehiclePhotoUseCase";
import { GetVehiclePhotosUseCase } from "../domain/useCases/photo/GetVehiclePhotosUseCase";
import { DeleteVehiclePhotoUseCase } from "../domain/useCases/photo/DeleteVehiclePhotoUseCase";
import { PhotoUseCases } from "../domain/useCases/photo/PhotoUseCases";
import { GetMyActiveTripsUseCase } from "../domain/useCases/clientRequest/GetMyActiveTripsUseCase";
import { ChangeDriverTripOfferStatusUseCase } from "../domain/useCases/driverTripOffer/ChangeDriverTripOfferStatusUseCase";
import { UpcomingTripsViewModel } from "../presentation/screens/upcoming/UpcomingTripsViewModel";

const authService = new AuthService();
const localStorage = new LocalStorage();
const authRepository = new AuthRespositoryImpl({ authService, localStorage });
const loginUseCase = new LoginUseCase({ authRepository });
const registerUseCase = new RegisterUseCase({ authRepository });
const saveAuthSessionUseCase = new SaveAuthSessionUseCase({ authRepository });
const getAuthSessionUseCase = new GetAuthSessionUseCase({ authRepository });
const removeAuthSessionUseCase = new RemoveAuthSessionUseCase({ authRepository });
const registerDriverUseCase = new RegisterDriverUseCase({ authRepository });
const forgotPasswordUseCase = new ForgotPasswordUseCase({ authRepository });
const resetPasswordUseCase = new ResetPasswordUseCase({ authRepository });
const changePasswordUseCase = new ChangePasswordUseCase({ authRepository });
const loginWithGoogleUseCase = new LoginWithGoogleUseCase({ authRepository });
const linkGoogleUseCase = new LinkGoogleUseCase({ authRepository });
const authUseCases = new AuthUseCases({
    loginUseCase,
    registerUseCase,
    registerDriverUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    changePasswordUseCase,
    loginWithGoogleUseCase,
    linkGoogleUseCase,
    saveAuthSessionUseCase,
    getAuthSessionUseCase,
    removeAuthSessionUseCase
});
// Las fotos las usan varias pantallas (registro, solicitud, viaje): se crean antes que sus ViewModels
// Las fotos las usan varias pantallas (registro, solicitud, viaje): se crean antes que sus ViewModels
const photoService = new PhotoService();
const photoRepository = new PhotoRepositoryImpl({ photoService });
const photoUseCases = new PhotoUseCases({
    uploadTripPhotoUseCase: new UploadTripPhotoUseCase({ photoRepository }),
    getTripPhotosUseCase: new GetTripPhotosUseCase({ photoRepository }),
    deleteTripPhotoUseCase: new DeleteTripPhotoUseCase({ photoRepository }),
    uploadVehiclePhotoUseCase: new UploadVehiclePhotoUseCase({ photoRepository }),
    getVehiclePhotosUseCase: new GetVehiclePhotosUseCase({ photoRepository }),
    deleteVehiclePhotoUseCase: new DeleteVehiclePhotoUseCase({ photoRepository }),
});
const loginViewModel = new LoginViewModel({ authUseCases });
const registerViewModel = new RegisterViewModel({ authUseCases });
const forgotPasswordViewModel = new ForgotPasswordViewModel({ authUseCases });
const driverVehicleRegisterViewModel = new DriverVehicleRegisterViewModel({ authUseCases, photoUseCases });
const changePasswordViewModel = new ChangePasswordViewModel({ authUseCases });

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
const getClientRequestByIdUseCase = new GetClientRequestByIdUseCase({ clientRequestRepository });
const getByClientAssignedUseCase = new GetByClientAssignedUseCase({ clientRequestRepository });
const getByDriverAssignedUseCase = new GetByDriverAssignedUseCase({ clientRequestRepository });
const updateDriverAssignedUseCase = new UpdateDriverAssignedUseCase({ clientRequestRepository });
const updateStatusUseCase = new UpdateStatusUseCase({ clientRequestRepository });
const updateDriverRatingUseCase = new UpdateDriverRatingUseCase({ clientRequestRepository });
const updateClientRatingUseCase = new UpdateClientRatingUseCase({ clientRequestRepository });
const raiseFareUseCase = new RaiseFareUseCase({ clientRequestRepository });
const cancelClientRequestUseCase = new CancelClientRequestUseCase({ clientRequestRepository });
const dismissClientRequestUseCase = new DismissClientRequestUseCase({ clientRequestRepository });
const deliverClientRequestUseCase = new DeliverClientRequestUseCase({ clientRequestRepository });
const confirmDeliveryUseCase = new ConfirmDeliveryUseCase({ clientRequestRepository });
const getMyActiveTripsUseCase = new GetMyActiveTripsUseCase({ clientRequestRepository });
const clientRequestUseCases = new ClientRequestUseCases({ getTimeAndDistanceUseCase, getNearbyTripRequestUseCase, getClientRequestByIdUseCase, createClientRequestUseCase, updateDriverAssignedUseCase, updateStatusUseCase, updateDriverRatingUseCase, updateClientRatingUseCase, getByClientAssignedUseCase, getByDriverAssignedUseCase, raiseFareUseCase, cancelClientRequestUseCase, dismissClientRequestUseCase, getMyActiveTripsUseCase, deliverClientRequestUseCase, confirmDeliveryUseCase });
const upcomingTripsViewModel = new UpcomingTripsViewModel({ clientRequestUseCases });
const socketService = new SocketService({} as any);
const driverPositionService = new DriverPositionService();
const driverPositionRepository = new DriverPositionRepositoryImpl({ driverPositionService });
const createDriverPositionUseCase = new CreateDriverPositionUseCase({ driverPositionRepository });
const getDriverPositionUseCase = new GetDriverPositionUseCase({ driverPositionRepository });
const driverPositionUseCases = new DriverPositionUseCases({ createDriverPositionUseCase, getDriverPositionUseCase });
const driverCarInfoService = new DriverCarInfoService();
const driverCarInfoRepository = new DriverCarInfoRepositoryImpl({ driverCarInfoService });
const createDriverCarInfoUseCase = new CreateDriverCarInfoUseCase({ driverCarInfoRepository });
const getDriverCarInfoUseCase = new GetDriverCarInfoUseCase({ driverCarInfoRepository });
const getMyDocumentsUseCase = new GetMyDocumentsUseCase({ driverCarInfoRepository });
const driverCarInfoUseCases = new DriverCarInfoUseCases({ createDriverCarInfoUseCase, getDriverCarInfoUseCase, getMyDocumentsUseCase });
const driverCarInfoViewModel = new DriverCarInfoViewModel({ driverCarInfoUseCases, photoUseCases });
const userService = new UserService();
const driverMyLocationMapViewModel = new DriverMyLocationMapViewModel({ googlePlaceUseCases, clientRequestUseCases, socketService, driverPositionUseCases });
const userRepository = new UserRepositoryImpl(userService);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const updateImageUserUseCase = new UpdateImageUserUseCase(userRepository);
const saveNotificationTokenUseCase = new SaveNotificationTokenUseCase(userRepository);
const userUseCases = new UserUseCases({ updateUserUseCase, updateImageUserUseCase, saveNotificationTokenUseCase });
const profileUpdateViewModel = new ProfileUpdateViewModel(userUseCases);
const driverTripOfferService = new DriverTripOfferService();
const driverTripOfferRepository = new DriverTripOfferRepositoryImpl({ driverTripOfferService });
const createDriverTripOfferUseCase = new CreateDriverTripOfferUseCase({ driverTripOfferRepository });
const getDriverTripOfferUseCase = new GetDriverTripOfferUseCase({ driverTripOfferRepository });
const changeDriverTripOfferStatusUseCase = new ChangeDriverTripOfferStatusUseCase({ driverTripOfferRepository });
const driverTripOfferUseCases = new DriverTripOfferUseCases({ createDriverTripOfferUseCase, getDriverTripOfferUseCase, changeDriverTripOfferStatusUseCase });
const clientSearchMapViewModel = new ClientSearchMapViewModel({ googlePlaceUseCases, clientRequestUseCases, socketService, driverTripOfferUseCases, driverCarInfoUseCases, photoUseCases });
const clientTripMapViewModel = new ClientTripMapViewModel({ clientRequestUseCases, socketService, googlePlaceUseCases, driverCarInfoUseCases, photoUseCases });
const driverTripMapViewModel = new DriverTripMapViewModel({ clientRequestUseCases, socketService, googlePlaceUseCases, photoUseCases });
const driverTripRatingViewModel = new DriverTripRatingViewModel({ clientRequestUseCases });
const clientTripRatingViewModel = new ClientTripRatingViewModel({ clientRequestUseCases });
const clientTripHistoryViewModel = new ClientTripHistoryViewModel({ clientRequestUseCases });
const driverTripHistoryViewModel = new DriverTripHistoryViewModel({ clientRequestUseCases });
const driverClientRequestViewModel = new DriverClientRequestViewModel({ clientRequestUseCases, driverPositionUseCases, driverTripOfferUseCases, socketService, photoUseCases });


type ContainerDeps = {
    loginViewModel: LoginViewModel;
    registerViewModel: RegisterViewModel;
    forgotPasswordViewModel: ForgotPasswordViewModel;
    driverVehicleRegisterViewModel: DriverVehicleRegisterViewModel;
    changePasswordViewModel: ChangePasswordViewModel;
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
    clientTripMapViewModel: ClientTripMapViewModel;
    driverTripMapViewModel: DriverTripMapViewModel;
    driverTripRatingViewModel: DriverTripRatingViewModel;
    clientTripRatingViewModel: ClientTripRatingViewModel;
    clientTripHistoryViewModel: ClientTripHistoryViewModel;
    driverTripHistoryViewModel: DriverTripHistoryViewModel;
    clientRequestService: ClientRequestService;
    clientRequestRepository: ClientRequestRepositoryImpl;
    getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
    getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
    getClientRequestByIdUseCase: GetClientRequestByIdUseCase;
    getByClientAssignedUseCase: GetByClientAssignedUseCase;
    getByDriverAssignedUseCase: GetByDriverAssignedUseCase;
    createClientRequestUseCase: CreateClientRequestUseCase;
    clientRequestUseCases: ClientRequestUseCases;
    updateDriverAssignedUseCase: UpdateDriverAssignedUseCase;
    updateDriverRatingUseCase: UpdateDriverRatingUseCase;
    updateClientRatingUseCase: UpdateClientRatingUseCase;
    updateStatusUseCase: UpdateStatusUseCase;
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
    driverCarInfoService: DriverCarInfoService;
    driverCarInfoRepository: DriverCarInfoRepositoryImpl;
    createDriverCarInfoUseCase: CreateDriverCarInfoUseCase;
    getDriverCarInfoUseCase: GetDriverCarInfoUseCase;
    driverCarInfoUseCases: DriverCarInfoUseCases;
    driverCarInfoViewModel: DriverCarInfoViewModel;
    userRepository: UserRepositoryImpl;
    updateUserUseCase: UpdateUserUseCase;
    updateImageUserUseCase: UpdateImageUserUseCase;
    userUseCases: UserUseCases;
    driverTripOfferService: DriverTripOfferService;
    driverTripOfferRepository: DriverTripOfferRepositoryImpl;
    createDriverTripOfferUseCase: CreateDriverTripOfferUseCase;
    getDriverTripOfferUseCase: GetDriverTripOfferUseCase;
    driverTripOfferUseCases: DriverTripOfferUseCases;
    upcomingTripsViewModel: UpcomingTripsViewModel;
};

const container = {
    resolve<K extends keyof ContainerDeps>(name: K): ContainerDeps[K] {
        const deps: ContainerDeps = {
            loginViewModel,
            registerViewModel,
            forgotPasswordViewModel,
            driverVehicleRegisterViewModel,
            changePasswordViewModel,
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
            clientTripMapViewModel,
            driverTripMapViewModel,
            driverTripRatingViewModel,
            clientTripRatingViewModel,
            clientTripHistoryViewModel,
            driverTripHistoryViewModel,
            clientRequestService,
            clientRequestRepository,
            getTimeAndDistanceUseCase,
            getNearbyTripRequestUseCase,
            getClientRequestByIdUseCase,
            getByClientAssignedUseCase,
            getByDriverAssignedUseCase,
            createClientRequestUseCase,
            updateDriverAssignedUseCase,
            updateDriverRatingUseCase,
            updateClientRatingUseCase,
            updateStatusUseCase,
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
            driverCarInfoService,
            driverCarInfoRepository,
            createDriverCarInfoUseCase,
            getDriverCarInfoUseCase,
            driverCarInfoUseCases,
            driverCarInfoViewModel,
            userRepository,
            updateUserUseCase,
            updateImageUserUseCase,
            userUseCases,
            profileUpdateViewModel,
            driverTripOfferService,
            driverTripOfferRepository,
            createDriverTripOfferUseCase,
            getDriverTripOfferUseCase,
            driverTripOfferUseCases,
            upcomingTripsViewModel
        };
        return deps[name];
    }
};

export { container };