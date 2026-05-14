import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalStorage } from "../../local/LocalStorage";
import { AuthResponse } from "../../../../domain/models/AuthResponse";

const BASE_URL = "http://192.168.0.39:3000";

const ApiRequestHandler = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});

ApiRequestHandler.interceptors.request.use(async (config) => {
    const data = await new LocalStorage().getItem('auth');
    if (data){
        const authResponse: AuthResponse = JSON.parse(data);
        config.headers['Authorization'] = authResponse.token;
    }
    return config;
});

const GoogleApiRequestHandler = axios.create({
    baseURL: "https://maps.googleapis.com/maps/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});



export  {ApiRequestHandler, GoogleApiRequestHandler, BASE_URL}