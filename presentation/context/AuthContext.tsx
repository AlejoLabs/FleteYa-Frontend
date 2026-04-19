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

export const AuthProvider = ({children}: any) => {
    const localStorage = new LocalStorage();
    const  [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
   
    useEffect(() => {
        getAuthSession();
    },[])


    const saveAuthSession = async (authResponse: AuthResponse) => {
        localStorage.save("auth", JSON.stringify(authResponse));
        setAuthResponse(authResponse);
    }

    const getAuthSession = async () => {
        const data = await localStorage.getItem("auth");
        const authData: AuthResponse = JSON.parse(data as any);
        console.log('Session Data: ', authData);
        setAuthResponse(authData);
    }

    const removeAuthSession = async () => {

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