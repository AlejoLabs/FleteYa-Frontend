import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";

export interface PasswordForm {
    current: string;
    next: string;
    confirm: string;
}

export type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

export class ChangePasswordViewModel {

    private authUseCases: AuthUseCases;

    constructor({ authUseCases }: { authUseCases: AuthUseCases }) {
        this.authUseCases = authUseCases;
    }

    // Una cuenta creada con Google no tiene contraseña actual que pedir
    validate(hasPassword: boolean, form: PasswordForm): PasswordErrors {
        const errors: PasswordErrors = {};
        if (hasPassword && form.current === '') errors.current = 'Escribe tu contraseña actual';
        if (form.next.length < 6) errors.next = 'Debe tener al menos 6 caracteres';
        else if (form.next !== form.confirm) errors.confirm = 'No coincide con la contraseña nueva';
        return errors;
    }

    async changePassword(hasPassword: boolean, currentPassword: string, newPassword: string) {
        return await this.authUseCases.changePassword.execute(hasPassword ? currentPassword : undefined, newPassword);
    }
}
