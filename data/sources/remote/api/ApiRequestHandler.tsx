import axios from "axios";

const ApiRequestHandler = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000 // 10 seconds timeout
});

export  {ApiRequestHandler}