import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalStorage } from "../../local/LocalStorage";
import { AuthResponse } from "../../../../domain/models/AuthResponse";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const ApiRequestHandler = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});

ApiRequestHandler.interceptors.request.use(async (config) => {
    const data = await new LocalStorage().getItem('auth');
    // Si la petición ya trae su token (por ejemplo, las fotos del vehículo justo después de registrarse), se respeta
    if (data && !config.headers['Authorization']){
        const authResponse: AuthResponse = JSON.parse(data);
        config.headers['Authorization'] = authResponse.token;
    }
    return config;
});

// El backend marca así el token vencido o inválido (otros 401, como una contraseña equivocada, no cierran la sesión)
const SESSION_EXPIRED = "SESSION_EXPIRED";
let onSessionExpired: (() => void) | null = null;

// La sesión de la app (AuthContext) decide qué hacer: borrar la sesión guardada y volver al inicio de sesión
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
    onSessionExpired = handler;
};

ApiRequestHandler.interceptors.response.use(undefined, (error) => {
    if (error.response?.status === 401 && error.response.data?.code === SESSION_EXPIRED) {
        onSessionExpired?.();
    }
    return Promise.reject(error);
});

const GoogleApiRequestHandler = axios.create({
    baseURL: "https://maps.googleapis.com/maps/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});



export  {ApiRequestHandler, GoogleApiRequestHandler, BASE_URL}