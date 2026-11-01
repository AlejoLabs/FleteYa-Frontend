import { createContext, useEffect, useRef, useState } from "react";
import { CommonActions } from "@react-navigation/native";
import { AuthResponse } from "../../domain/models/AuthResponse";
import { LocalStorage } from "../../data/sources/local/LocalStorage";
import { getPushToken } from "../utils/PushNotifications";
import { setSessionExpiredHandler } from "../../data/sources/remote/api/ApiRequestHandler";
import { navigationRef } from "../navigator/navigationRef";
import { useToast } from "../components/ui";

export interface AuthContextProps {

    authResponse: AuthResponse | null;
    saveAuthSession: (authResponse: AuthResponse) => Promise<void>;
    getAuthSession: () => Promise<void>;
    removeAuthSession: () => Promise<void>;
}

export const AuthContext = createContext ( {} as AuthContextProps );

export const AuthProvider = ({children, authUseCases, socketService, userUseCases}: any) => {
    const  [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
    const { showToast } = useToast();
    // Varias peticiones pueden fallar a la vez con el token vencido: la sesión se cierra una sola vez
    const expiring = useRef(false);
   
    useEffect(() => {
        getAuthSession();
    },[])

    // El token venció (dura 2 días) o dejó de ser válido: se borra la sesión de este teléfono y se vuelve al inicio.
    // No se avisa al backend (ya no acepta el token); al entrar de nuevo, el teléfono vuelve a registrar sus avisos
    useEffect(() => {
        setSessionExpiredHandler(async () => {
            if (expiring.current) return;
            expiring.current = true;
            await authUseCases.removeAuthSession.execute();
            socketService?.disconnect();
            setAuthResponse(null);
            if (navigationRef.isReady()) {
                navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'LoginScreen' }] }));
            }
            showToast('Tu sesión venció. Entra de nuevo para seguir.', 'info');
        });
        return () => setSessionExpiredHandler(null);
    }, []);

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