import axios from "axios";

const ApiRequestHandler = axios.create({
    baseURL: "http://10.79.134.20:3000",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});

export  {ApiRequestHandler}