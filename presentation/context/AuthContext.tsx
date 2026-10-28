import { createContext, useEffect, useState } from "react";
import { AuthResponse } from "../../domain/models/AuthResponse";
import { LocalStorage } from "../../data/sources/local/LocalStorage";
import { getPushToken } from "../utils/PushNotifications";

export interface AuthContextProps {

    authResponse: AuthResponse | null;
    saveAuthSession: (authResponse: AuthResponse) => Promise<void>;
    getAuthSession: () => Promise<void>;
    removeAuthSession: () => Promise<void>;
}

export const AuthContext = createContext ( {} as AuthContextProps );

export const AuthProvider = ({children, authUseCases, socketService, userUseCases}: any) => {
    const  [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
   
    useEffect(() => {
        getAuthSession();
    },[])

    // Con sesión abierta, el backend guarda el token de este teléfono para mandarle notificaciones
    useEffect(() => {
        if (!authResponse?.token) return;
        getPushToken().then((token) => {
            if (token) userUseCases?.saveNotificationToken.execute(token);
        });
    }, [authResponse?.token]);


    const saveAuthSession = async (authResponse: AuthResponse) => {
        await authUseCases.saveAuthSession.execute(authResponse);
        setAuthResponse(authResponse);
    }

    const getAuthSession = async () => {
        const authData = await authUseCases.getAuthSession.execute();
        setAuthResponse(authData);
    }

    const removeAuthSession = async () => {
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