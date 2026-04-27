import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ApiRequestHandler = axios.create({
    baseURL: "http://192.168.0.39:3000",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});

ApiRequestHandler.interceptors.request.use(async (config) => {
    const data = await AsyncStorage.getItem("auth");
    if (data) config.headers.Authorization = JSON.parse(data).token;
    return config;
});

const GoogleApiRequestHandler = axios.create({
    baseURL: "https://maps.googleapis.com/maps/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});


export  {ApiRequestHandler, GoogleApiRequestHandler}