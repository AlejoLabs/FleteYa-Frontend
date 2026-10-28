import { GoogleSignin, isCancelledResponse, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";

// webClientId es el ID de cliente "Aplicación web" de Google Cloud: el token que entrega Google va dirigido a él
// y el backend lo verifica con ese mismo ID (GOOGLE_WEB_CLIENT_ID)
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export type GoogleTokenResult =
    | { ok: true; idToken: string }
    | { ok: false; cancelled: boolean; message: string };

// Abre el selector de cuentas de Google y devuelve el idToken para mandarlo al backend
export const getGoogleIdToken = async (): Promise<GoogleTokenResult> => {
    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Cierra la sesión de Google anterior para que siempre deje elegir la cuenta
        await GoogleSignin.signOut();
        const response = await GoogleSignin.signIn();
        if (isCancelledResponse(response)) {
            return { ok: false, cancelled: true, message: '' };
        }
        if (isSuccessResponse(response) && response.data.idToken) {
            return { ok: true, idToken: response.data.idToken };
        }
        return { ok: false, cancelled: false, message: 'Google no devolvió los datos de la cuenta' };
    } catch (error) {
        if (isErrorWithCode(error)) {
            if (error.code === statusCodes.IN_PROGRESS) return { ok: false, cancelled: true, message: '' };
            if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                return { ok: false, cancelled: false, message: 'Este teléfono no tiene Google Play Services' };
            }
            console.log('Error de Google Sign-In', error.code, error.message);
            return { ok: false, cancelled: false, message: `No se pudo entrar con Google (${error.code})` };
        }
        console.log('Error de Google Sign-In', error);
        return { ok: false, cancelled: false, message: 'No se pudo entrar con Google' };
    }
}
