import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { reconnectAllSockets, disconnectAllSockets } from "@/api/websocket";
import { refreshAccessToken } from "@/api/refreshAccessToken";
import { logout } from "@/store/actions/logout";

// Base URL for the Merchant App Backend
import {BASE_URL} from '@/config/config';
import {setPendingRequest, setRedirectAfterAuth} from "@/store/authSlice";

let isRefreshing = false; // Track if a refresh attempt is already in progress
let logoutInProgress = false; // Track if logout is in progress
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
const axiosClientGetter = () => {
    let instance = axios.create({
        baseURL: BASE_URL,
        headers: {
            "Content-Type": "application/json", // Default content type
        },
        withCredentials: true,
    });

    instance.interceptors.request.use(
        async (config) => {
            if (logoutInProgress) {
                // Block all API requests while logout is in progress
                console.warn("Logout is in progress. Blocking API request:", config.url);
                return Promise.reject({ message: "Logout in progress" });
            }

            const token = await AsyncStorage.getItem("accessToken"); // Retrieve token from storage
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

            // Exclude all /auth/* endpoints from triggering retries or logout
            if (originalRequest.url.includes("/auth")) {
                return Promise.reject(error);
            }

            console.log("Interceptor caught error:", error.response?.status, error.config);

            // If the error is a 401 and not a retry of the refresh token itself
            if (error.response.status === 401 && !originalRequest._retry) {
                console.log("401 detected - attempting refresh...");

                if (logoutInProgress) {
                    console.warn("Logout is already in progress. Ignoring further 401 handling.");
                    return Promise.reject(error);
                }

                if (isRefreshing) {
                    console.log("isRefreshing in progress, so queuing.");
                    // If a refresh is already in progress, queue the current request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            resolve: (token) => {
                                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                                resolve(instance(originalRequest));
                            },
                            reject: (err) => reject(err),
                        });
                    });
                }

                const token = await AsyncStorage.getItem("accessToken");

                if (!token) {
                    // User is a guest → show login modal instead of refresh
                    console.log("Guest user triggered 401. Skipping refresh. Redirecting to Auth.");
                    const safelySerializableRequest = getSerializableRequestConfig(originalRequest);
                    dispatch(setPendingRequest(safelySerializableRequest));
                    dispatch(setRedirectAfterAuth({redirectTo: router.pathname}))
                    router.push('/Authentication')
                    return Promise.reject(error);
                }

                originalRequest._retry = true; // Mark this request as already retried
                isRefreshing = true; // Set the refreshing flag

                try {
                    console.log("Attempting to refresh token...");
                    const newAccessToken = await refreshAccessToken();
                    console.log("New access token:", newAccessToken);

                    // Reconnect all WebSocket connections with the new token
                    await reconnectAllSockets();

                    // Update headers of queued requests with the new token
                    processQueue(null, newAccessToken);

                    // Retry the original request with the new access token
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                } catch (refreshError) {
                    console.error("Refresh token expired or invalid:", refreshError);
                    processQueue(refreshError, null); // Reject queued requests

                    // Initiate logout if refresh fails
                    if (!logoutInProgress) {
                        logoutInProgress = true; // Prevent multiple logout calls
                        console.log("Initiating logout due to failed token refresh...");
                        try {
                            await logout(dispatch, router); // Pass `dispatch` and `router` to logout
                        } finally {
                            logoutInProgress = false; // Reset the flag
                        }
                    }

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false; // Reset the refreshing flag
                }
            }

            console.log("Error is not 401");
            // Reject any other errors
            return Promise.reject(error);
        }
    );

    return instance;
};

const axiosClient = axiosClientGetter();
export default axiosClient;

// Pass the Redux `dispatch` and `router` to the Axios client
export const setAxiosDependencies = (reduxDispatch, expoRouter) => {
    dispatch = reduxDispatch;
    router = expoRouter;
};

function getSerializableRequestConfig(config) {
    return {
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.params,
        headers: config.headers ? JSON.parse(JSON.stringify(config.headers)) : undefined,
        withCredentials: config.withCredentials ?? true,
    };
}