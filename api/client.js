import axios from "axios";

// Base URL for the Merchant App Backend
const BASE_URL = "https://api.merchant.pocketshop.in"; // Replace with your actual backend URL

// Function to retrieve the JWT (update this function as per your auth setup)
const getJWT = () => {
    // Replace with your logic to retrieve the JWT (e.g., from localStorage, AsyncStorage, Redux store, etc.)
    return 'dummyToken';
    // return localStorage.getItem("authToken");
};

// Create an Axios instance with the baseURL
const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json", // Default content type
    },
});

// Add a request interceptor to attach the JWT to the headers
axiosClient.interceptors.request.use(
    (config) => {
        const token = getJWT();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

export default axiosClient;