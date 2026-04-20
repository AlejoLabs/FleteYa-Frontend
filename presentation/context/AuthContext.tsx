import { createContext, useEffect, useState } from "react";
import { AuthResponse } from "../../domain/models/AuthResponse";
import { LocalStorage } from "../../data/sources/local/LocalStorage";

export interface AuthContextProps {

    authResponse: AuthResponse | null;
    saveAuthSession: (authResponse: AuthResponse) => Promise<void>;
    getAuthSession: () => Promise<void>;
    removeAuthSession: () => Promise<void>;
}

export const AuthContext = createContext ( {} as AuthContextProps );

export const AuthProvider = ({children, authUseCases}: any) => {
    const  [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
   
    useEffect(() => {
        getAuthSession();
    },[])


    const saveAuthSession = async (authResponse: AuthResponse) => {
        await authUseCases.saveAuthSession.execute(authResponse);
        setAuthResponse(authResponse);
    }

    const getAuthSession = async () => {
        const authData = await authUseCases.getAuthSession.execute();
        console.log('Session Data: ', authData);
        setAuthResponse(authData);
    }

    const removeAuthSession = async () => {
        await authUseCases.removeAuthSession.execute();
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