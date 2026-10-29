import { useState } from "react";
import { container } from "../../../../di/container";
import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { useToast } from "../../../components/ui";
import { formatErrorMessage } from "../../../utils/Formatters";
import { getGoogleIdToken } from "../../../utils/GoogleAuth";

// Estado del botón de Google y del paso de vincular una cuenta que ya tenía contraseña.
// onSignedIn recibe la sesión; la pantalla decide si guarda y a dónde vuelve
export function useGoogleSignIn(onSignedIn: (response: AuthResponse) => void) {

    const viewModel = container.resolve('googleSignInViewModel');
    const { showToast } = useToast();
    const [isBusy, setIsBusy] = useState(false);
    // Token de Google pendiente de vincular a una cuenta que ya existía con ese correo
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [linkPassword, setLinkPassword] = useState('');
    const [linkError, setLinkError] = useState<string | null>(null);

    const start = async () => {
        if (isBusy) return;
        setIsBusy(true);
        const google = await getGoogleIdToken();
        if (!google.ok) {
            setIsBusy(false);
            if (!google.cancelled) showToast(google.message, 'error');
            return;
        }
        const response = await viewModel.signIn(google.idToken);
        setIsBusy(false);
        if ('token' in response) {
            onSignedIn(response);
        } else if (response.code === 'LINK_REQUIRED') {
            // El correo ya tiene cuenta con contraseña: se pide una vez para vincular Google a esa cuenta
            setLinkToken(google.idToken);
        } else {
            showToast(formatErrorMessage(response.message), 'error');
        }
    }

    const closeLink = () => {
        setLinkToken(null);
        setLinkPassword('');
        setLinkError(null);
    }

    const confirmLink = async () => {
        if (!linkToken) return;
        const problem = viewModel.validateLinkPassword(linkPassword);
        setLinkError(problem);
        if (problem) return;
        setIsBusy(true);
        const response = await viewModel.link(linkToken, linkPassword);
        setIsBusy(false);
        if ('token' in response) {
            closeLink();
            showToast('Cuenta vinculada: ya puedes entrar con Google o con tu contraseña', 'success');
            onSignedIn(response);
        } else {
            setLinkError(formatErrorMessage(response.message));
        }
    }

    const changeLinkPassword = (value: string) => {
        setLinkPassword(value);
        setLinkError(null);
    }

    return {
        isBusy,
        start,
        link: {
            visible: linkToken !== null,
            password: linkPassword,
            error: linkError,
            onChangePassword: changeLinkPassword,
            onConfirm: confirmLink,
            onCancel: closeLink,
        },
    };
}

export type GoogleLinkState = ReturnType<typeof useGoogleSignIn>['link'];
