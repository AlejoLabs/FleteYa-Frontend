import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";
import EmailValidator from "../../../utils/EmailValidator";

export interface ResetErrors {
    code?: string;
    password?: string;
}

export const CODE_LENGTH = 6;
// Espera antes de dejar pedir otro código, para no llenar el correo
export const RESEND_WAIT_SECONDS = 60;

export class ForgotPasswordViewModel {

    private authUseCases: AuthUseCases;

    constructor({ authUseCases }: { authUseCases: AuthUseCases }) {
        this.authUseCases = authUseCases;
    }

    // Devuelve el problema a mostrar o null si se puede enviar
    validateEmail(email: string): string | null {
        if (email.trim() === '') return 'Escribe tu correo';
        return EmailValidator(email.trim()) ? null : 'Escribe un correo completo, por ejemplo nombre@gmail.com';
    }

    validateReset(code: string, password: string): ResetErrors {
        const errors: ResetErrors = {};
        if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code.trim())) errors.code = `El código tiene ${CODE_LENGTH} dígitos`;
        if (password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
        return errors;
    }

    // "nombre@gmail.com" → "n•••••@gmail.com", para confirmar a dónde llegó sin mostrarlo entero
    maskEmail(email: string): string {
        const [user, domain] = email.trim().split('@');
        if (!domain) return email.trim();
        return `${user.charAt(0)}${'•'.repeat(Math.max(user.length - 1, 2))}@${domain}`;
    }

    async sendCode(email: string) {
        return await this.authUseCases.forgotPassword.execute(email.trim());
    }

    async resetPassword(email: string, code: string, password: string) {
        return await this.authUseCases.resetPassword.execute(email.trim(), code.trim(), password);
    }
}
