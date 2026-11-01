import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";
import EmailValidator from "../../../utils/EmailValidator";

export interface LoginErrors {
    email?: string;
    password?: string;
}

export type HomeRoute = 'RolesScreen' | 'DriverHomeScreen' | 'ClientHomeScreen';

export class LoginViewModel {

    private authUseCases: AuthUseCases;

    constructor({authUseCases}: {authUseCases: AuthUseCases}){
        this.authUseCases = authUseCases;
    }

    // Devuelve el error de cada campo; vacío si se puede enviar
    validate(email: string, password: string): LoginErrors {
        const errors: LoginErrors = {};
        if (email.trim() === '') errors.email = 'Escribe tu correo';
        else if (!EmailValidator(email.trim())) errors.email = 'Escribe un correo completo, por ejemplo nombre@gmail.com';
        if (password === '') errors.password = 'Escribe tu contraseña';
        return errors;
    }

    async login(email: string, password: string): Promise<AuthResponse | ErrorResponse>{
        return await this.authUseCases.login.execute(email.trim(), password);
    }

    // Con varios roles se elige; con uno se entra directo (un conductor recién registrado solo tiene DRIVER)
    homeRouteFor(authResponse: AuthResponse): HomeRoute {
        const roles = authResponse.user.roles ?? [];
        if (roles.length > 1) return 'RolesScreen';
        return roles[0]?.id === 'DRIVER' ? 'DriverHomeScreen' : 'ClientHomeScreen';
    }
}
