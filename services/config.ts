import axios from "axios";
import { getToken } from "@/utils/auth"; // Adjust the import as needed

// const BASE_URL = "http://192.168.31.142:5000";
const BASE_URL = "http://192.168.1.3:5000";

// Create an axios instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to add token to the Authorization header
api.interceptors.request.use(
    async (config) => {
        const token = await getToken(); // Get token asynchronously
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Add token to headers
        }
        return config; // Continue with the request
    },
    (error) => {
        return Promise.reject(error); // Handle request error
    }
);

export default api;
