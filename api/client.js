import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {clearMerchant} from "@/store/merchantSlice";
import {clearStore} from "@/store/storeSlice";

// Base URL for the Merchant App Backend
export const BASE_URL = "https://api.merchant.pocketshop.in"; // Replace with your actual backend URL


let isRefreshing = false; // Track if a refresh attempt is already in progress
let failedQueue = []; // Queue to store requests while the refresh token is being processed
let dispatch = null; // To hold the Redux dispatch function
let router = null; // To hold the Expo Router navigation function

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

// Create an Axios instance with the baseURL
const axiosClientGetter = ()  => {

    let instance = axios.create({
        baseURL: BASE_URL,
        headers: {
            "Content-Type": "application/json", // Default content type
        },
        withCredentials: true,
    });

    instance.interceptors.request.use(
        async (config) => {
            const token = await AsyncStorage.getItem('accessToken'); // Retrieve token from storage
            if (token) {
                config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response, // Return the response if successful
        async (error) => {
            const originalRequest = error.config;

            // If the error is a 401 and not a retry of the refresh token itself
            if (error.response.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    // If a refresh is already in progress, queue the current request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            resolve: (token) => {
                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                                resolve(instance(originalRequest));
                            },
                            reject: (err) => reject(err),
                        });
                    });
                }

                originalRequest._retry = true; // Mark this request as already retried
                isRefreshing = true; // Set the refreshing flag

                try {
                    console.log('attempting to refresh token');
                    const response = await instance.post('/auth/refreshToken', {}, { withCredentials: true });
                    const newAccessToken = response.data.accessToken;
                    console.log('attempting to refresh token, newAT:', newAccessToken);
                    // Save the new access token
                    await AsyncStorage.setItem('accessToken', newAccessToken);

                    // Update headers of queued requests with the new token
                    processQueue(null, newAccessToken);

                    // Retry the original request with the new access token
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                } catch (refreshError) {
                    console.error('Refresh token expired or invalid:', refreshError);
                    processQueue(refreshError, null); // Reject queued requests

                    // Redirect to login or handle logout
                    AsyncStorage.removeItem('accessToken');
                    instance.post('/auth/logout');
                    dispatch(clearMerchant());
                    dispatch(clearStore);
                    router.push('/Authentication');

                    // Redirect user to login page, e.g., navigation.navigate('/login');
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false; // Reset the refreshing flag
                }
            }
            console.log('error is not 401');
            // Reject any other errors
            return Promise.reject(error);
        }
    );
    return instance;
}

const axiosClient = axiosClientGetter();
export default axiosClient;

export const setAxiosDependencies = (reduxDispatch, expoRouter) => {
    dispatch = reduxDispatch;
    router = expoRouter;
};
