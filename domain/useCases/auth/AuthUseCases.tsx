import { GetAuthSessionUseCase } from "./GetAuthSessionUseCase";
import { LoginUseCase } from "./LoginUseCase";
import { RegisterUseCase } from "./RegisterUseCase";
import { RemoveAuthSessionUseCase } from "./RemoveAuthSessionUseCase";
import { SaveAuthSessionUseCase } from "./SaveAuthSessionUseCase";
import { RegisterDriverUseCase } from "./RegisterDriverUseCase";
import { ForgotPasswordUseCase } from "./ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "./ResetPasswordUseCase";
import { ChangePasswordUseCase } from "./ChangePasswordUseCase";
import { LoginWithGoogleUseCase } from "./LoginWithGoogleUseCase";
import { LinkGoogleUseCase } from "./LinkGoogleUseCase";

export class AuthUseCases {

    login: LoginUseCase;
    register: RegisterUseCase;
    registerDriver: RegisterDriverUseCase;
    forgotPassword: ForgotPasswordUseCase;
    resetPassword: ResetPasswordUseCase;
    changePassword: ChangePasswordUseCase;
    loginWithGoogle: LoginWithGoogleUseCase;
    linkGoogle: LinkGoogleUseCase;
    saveAuthSession: SaveAuthSessionUseCase;
    getAuthSession: GetAuthSessionUseCase;
    removeAuthSession: RemoveAuthSessionUseCase;

    constructor({
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
    }: {
        loginUseCase: LoginUseCase,
        registerUseCase: RegisterUseCase,
        registerDriverUseCase: RegisterDriverUseCase,
        forgotPasswordUseCase: ForgotPasswordUseCase,
        resetPasswordUseCase: ResetPasswordUseCase,
        changePasswordUseCase: ChangePasswordUseCase,
        loginWithGoogleUseCase: LoginWithGoogleUseCase,
        linkGoogleUseCase: LinkGoogleUseCase,
        saveAuthSessionUseCase: SaveAuthSessionUseCase,
        getAuthSessionUseCase: GetAuthSessionUseCase,
        removeAuthSessionUseCase: RemoveAuthSessionUseCase
    }) {
        this.login = loginUseCase;
        this.register = registerUseCase;
        this.registerDriver = registerDriverUseCase;
        this.forgotPassword = forgotPasswordUseCase;
        this.resetPassword = resetPasswordUseCase;
        this.changePassword = changePasswordUseCase;
        this.loginWithGoogle = loginWithGoogleUseCase;
        this.linkGoogle = linkGoogleUseCase;
        this.saveAuthSession = saveAuthSessionUseCase;
        this.getAuthSession = getAuthSessionUseCase;
        this.removeAuthSession = removeAuthSessionUseCase;
    }
}
