import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { User } from "../../../../domain/models/User";
import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";
import EmailValidator from "../../../utils/EmailValidator";

// Cliente envía carga; conductor la transporta y además registra su vehículo en el paso siguiente
export type AccountType = 'CLIENT' | 'DRIVER';

export interface RegisterForm {
    name: string;
    lastname: string;
    phone: string;
    email: string;
    password: string;
}

export type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

export class RegisterViewModel {

    private authUseCases: AuthUseCases;

    constructor({authUseCases}: {authUseCases: AuthUseCases}){
        this.authUseCases = authUseCases;
    }

    // Devuelve el error de cada campo; vacío si se puede enviar
    validate(form: RegisterForm): RegisterErrors {
        const errors: RegisterErrors = {};
        if (form.name.trim() === '') errors.name = 'Escribe tu nombre';
        if (form.lastname.trim() === '') errors.lastname = 'Escribe tu apellido';
        if (!/^\d{10}$/.test(this.cleanPhone(form.phone))) errors.phone = 'Escribe los 10 dígitos de tu celular';
        if (form.email.trim() === '') errors.email = 'Escribe tu correo';
        else if (!EmailValidator(form.email.trim())) errors.email = 'Escribe un correo completo, por ejemplo nombre@gmail.com';
        if (form.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
        return errors;
    }

    // Los datos ya limpios, listos para crear la cuenta o pasar al registro del vehículo
    toAccount(form: RegisterForm): User {
        return {
            name: form.name.trim(),
            lastname: form.lastname.trim(),
            email: form.email.trim(),
            phone: this.cleanPhone(form.phone),
            password: form.password,
        };
    }

    async register(user: User): Promise<AuthResponse | ErrorResponse>{
        return await this.authUseCases.register.execute(user);
    }

    private cleanPhone(phone: string): string {
        return phone.replace(/\D/g, '');
    }
}
