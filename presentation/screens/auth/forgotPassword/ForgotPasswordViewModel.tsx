import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";
import EmailValidator from "../../../utils/EmailValidator";

export class ForgotPasswordViewModel {

    private authUseCases: AuthUseCases;

    constructor({ authUseCases }: { authUseCases: AuthUseCases }) {
        this.authUseCases = authUseCases;
    }

    // Devuelve el problema a mostrar o null si se puede enviar
    validateEmail(email: string): string | null {
        return EmailValidator(email.trim()) ? null : 'Escribe un correo válido';
    }

    validateReset(code: string, password: string, confirmPassword: string): string | null {
        if (!/^\d{6}$/.test(code.trim())) return 'El código tiene 6 dígitos';
        if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        if (password !== confirmPassword) return 'Las contraseñas no coinciden';
        return null;
    }

    async sendCode(email: string) {
        return await this.authUseCases.forgotPassword.execute(email.trim());
    }

    async resetPassword(email: string, code: string, password: string) {
        return await this.authUseCases.resetPassword.execute(email.trim(), code.trim(), password);
    }
}
