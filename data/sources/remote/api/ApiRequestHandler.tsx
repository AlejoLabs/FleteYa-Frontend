import axios from "axios";

const ApiRequestHandler = axios.create({
    baseURL: "http://192.168.0.39:3000",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});

const GoogleApiRequestHandler = axios.create({
    baseURL: "https://maps.googleapis.com/maps/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});


export  {ApiRequestHandler, GoogleApiRequestHandler}