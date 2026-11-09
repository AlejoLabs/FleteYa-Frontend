import { createContext, useEffect, useRef, useState } from "react";
import { CommonActions } from "@react-navigation/native";
import { AuthResponse } from "../../domain/models/AuthResponse";
import { LocalStorage } from "../../data/sources/local/LocalStorage";
import { getPushToken } from "../utils/PushNotifications";
import { setSessionExpiredHandler } from "../../data/sources/remote/api/ApiRequestHandler";
import { navigationRef } from "../navigator/navigationRef";
import { useToast } from "../components/ui";
import { currentLanguage, setLanguage } from "../../i18n";
import { toSupportedLanguage } from "../../i18n/languages";
import { useTranslation } from 'react-i18next';
import { t } from '../../i18n';

export interface AuthContextProps {

    authResponse: AuthResponse | null;
    saveAuthSession: (authResponse: AuthResponse) => Promise<void>;
    getAuthSession: () => Promise<void>;
    removeAuthSession: () => Promise<void>;
}

export const AuthContext = createContext ( {} as AuthContextProps );

export const AuthProvider = ({children, authUseCases, socketService, userUseCases}: any) => {
    const { t } = useTranslation();
    const  [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
    const { showToast } = useToast();
    // Varias peticiones pueden fallar a la vez con el token vencido: la sesión se cierra una sola vez
    const expiring = useRef(false);
   
    useEffect(() => {
        getAuthSession();
    },[])

    // El token venció (dura 2 días), dejó de ser válido o el admin suspendió la cuenta: se borra la sesión de este
    // teléfono y se vuelve al inicio. No se avisa al backend (ya no acepta el token); al entrar de nuevo, el teléfono
    // vuelve a registrar sus avisos. Con la cuenta suspendida llega el motivo y se muestra como error
    const endSession = async (suspendedMessage?: string) => {
        if (expiring.current) return;
        expiring.current = true;
        await authUseCases.removeAuthSession.execute();
        socketService?.disconnect();
        setAuthResponse(null);
        if (navigationRef.isReady()) {
            navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'LoginScreen' }] }));
        }
        if (suspendedMessage) showToast(suspendedMessage, 'error');
        else showToast(t('authContext.tuSesionVencioEntraDe'), 'info');
    }

    useEffect(() => {
        setSessionExpiredHandler(endSession);
        return () => setSessionExpiredHandler(null);
    }, []);

    // La suspensión llega también por el socket, para sacar a la persona aunque no esté haciendo nada en la app
    useEffect(() => {
        if (!authResponse?.token || !socketService) return;
        return socketService.onMessage('account_suspended', (data: any) => {
            const reason = typeof data?.reason === 'string' && data.reason ? `: ${data.reason}` : '';
            endSession(t('authContext.tuCuentaEstaSuspendidaSi', { reason }));
        });
    }, [authResponse?.token]);

    // El idioma guardado en la cuenta manda al entrar: así el mismo usuario ve la app igual en cualquier teléfono
    useEffect(() => {
        const language = toSupportedLanguage(authResponse?.user?.language);
        if (language && language !== currentLanguage()) setLanguage(language);
    }, [authResponse?.user?.language]);

    // Con sesión abierta, el backend guarda el token de este teléfono para mandarle notificaciones
    useEffect(() => {
        if (!authResponse?.token) return;
        getPushToken().then((token) => {
            if (token) userUseCases?.saveNotificationToken.execute(token);
        });
    }, [authResponse?.token]);


    const saveAuthSession = async (authResponse: AuthResponse) => {
        expiring.current = false;
        await authUseCases.saveAuthSession.execute(authResponse);
        setAuthResponse(authResponse);
    }

    const getAuthSession = async () => {
        const authData = await authUseCases.getAuthSession.execute();
        setAuthResponse(authData);
    }

    const removeAuthSession = async () => {
        // Si el token ya venció, el aviso de abajo falla con 401: que no se cuente como sesión vencida
        expiring.current = true;
        // Antes de borrar la sesión (todavía hay token): este teléfono deja de recibir avisos de la cuenta
        await userUseCases?.saveNotificationToken.execute(null);
        await authUseCases.removeAuthSession.execute();
        // El socket quedó autenticado con este usuario: si no se cierra, el siguiente que entre recibiría sus eventos
        socketService?.disconnect();
        setAuthResponse(null);
    }

    return (
        <AuthContext.Provider value={{ 
            authResponse, 
            saveAuthSession, 
            getAuthSession, 
            removeAuthSession 
        }}>
            {children}
        </AuthContext.Provider> 
    )

}