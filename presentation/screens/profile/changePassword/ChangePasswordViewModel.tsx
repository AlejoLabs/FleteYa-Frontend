import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";

export class ChangePasswordViewModel {

    private authUseCases: AuthUseCases;

    constructor({ authUseCases }: { authUseCases: AuthUseCases }) {
        this.authUseCases = authUseCases;
    }

    // Una cuenta creada con Google no tiene contraseña actual que pedir
    validate(hasPassword: boolean, currentPassword: string, newPassword: string, confirmPassword: string): string | null {
        if (hasPassword && currentPassword === '') return 'Escribe tu contraseña actual';
        if (newPassword.length < 6) return 'La contraseña nueva debe tener al menos 6 caracteres';
        if (newPassword !== confirmPassword) return 'Las contraseñas nuevas no coinciden';
        return null;
    }

    async changePassword(hasPassword: boolean, currentPassword: string, newPassword: string) {
        return await this.authUseCases.changePassword.execute(hasPassword ? currentPassword : undefined, newPassword);
    }
}
