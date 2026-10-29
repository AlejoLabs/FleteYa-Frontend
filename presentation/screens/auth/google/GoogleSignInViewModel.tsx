import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";

// Entrar o registrarse con Google: lo usan el login y el registro de cliente.
// El backend crea la cuenta como cliente si el correo no existía
export class GoogleSignInViewModel {

    private authUseCases: AuthUseCases;

    constructor({ authUseCases }: { authUseCases: AuthUseCases }) {
        this.authUseCases = authUseCases;
    }

    async signIn(idToken: string) {
        return await this.authUseCases.loginWithGoogle.execute(idToken);
    }

    validateLinkPassword(password: string): string | null {
        return password === '' ? 'Escribe la contraseña de tu cuenta' : null;
    }

    async link(idToken: string, password: string) {
        return await this.authUseCases.linkGoogle.execute(idToken, password);
    }
}
