import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { reconnectAllSockets } from "@/api/websocket";
import { refreshAccessToken } from "@/api/refreshAccessToken";
import { logout } from "../store/actions/logout";

import {setPendingRequest, setRedirectAfterAuth} from "@/store/authSlice";
import Constants from 'expo-constants';
import {Platform} from "react-native";
import {openAuthModal} from "../store/authSlice";

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;
const IS_WEB = Platform.OS === 'web';
let isRefreshing = false; // Track if a refresh attempt is already in progress
let logoutInProgress = false; // Track if logout is in progress
let failedQueue = []; // Queue to store requests while the refresh token is being processed
let dispatch = null; // To hold the Redux dispatch function
let axiosInstance = null;
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
const createAxiosInstance = () => {
    let instance = axios.create({
        baseURL: API_BASE_URL,
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
            // Only attempt to get token if on client-side for web, or on native
            if ((Platform.OS === 'web' && typeof window !== 'undefined') || Platform.OS !== 'web') {
                try {
                    const token = await AsyncStorage.getItem("accessToken");
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (e) {
                    console.error("AsyncStorage error in request interceptor:", e);
                    // Decide if you want to proceed without a token or reject
                }
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

                let token = null;
                if ((Platform.OS === 'web' && typeof window !== 'undefined') || Platform.OS !== 'web') {
                    try {
                        token = await AsyncStorage.getItem("accessToken");
                    } catch (e) {
                        console.error("AsyncStorage error during 401 handling:", e);
                    }
                }

                if (!token) {
                    console.log("Guest user triggered 401 or no token. Skipping refresh.");
                    if (router && dispatch && router.pathname !== '/Authentication') { // Ensure router and dispatch are set
                        const safelySerializableRequest = getSerializableRequestConfig(originalRequest);
                        dispatch(setPendingRequest(safelySerializableRequest));
                        dispatch(setRedirectAfterAuth(router.pathname));
                        if (IS_WEB) {
                            dispatch(openAuthModal());
                        } else {
                            console.log("Redirecting to Authentication page...");
                            router.push('/Authentication');
                        }

                    } else {
                        console.warn("Router or dispatch not available for guest 401 redirect.");
                    }
                    return Promise.reject(error);
                }

                originalRequest._retry = true; // Mark this request as already retried
                isRefreshing = true; // Set the refreshing flag

                try {
                    console.log("Attempting to refresh token...");
                    const newAccessToken = await refreshAccessToken();
                    console.log("New access token:", newAccessToken);

                    if ((Platform.OS === 'web' && typeof window !== 'undefined') || Platform.OS !== 'web') {
                        await AsyncStorage.setItem("accessToken", newAccessToken); // Save new token
                    }

                    // Reconnect WebSocket if needed and if on client
                    if ((Platform.OS === 'web' && typeof window !== 'undefined') || Platform.OS !== 'web') {
                        await reconnectAllSockets(); // Ensure this is safe to call or also checks platform
                    }
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
                            await dispatch(logout(router)); // Pass `dispatch` and `router` to logout
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

// Getter function for the Axios client (Singleton pattern)
export const getAxiosClient = () => {
    if (!axiosInstance) {
        // Crucially, only create the instance (and thus attach interceptors)
        // if it doesn't exist. This will typically happen on the client-side first.
        if ((Platform.OS === 'web' && typeof window !== 'undefined') || Platform.OS !== 'web') {
            axiosInstance = createAxiosInstance();
        } else {
            // On the server, or if window is not defined on web for some reason during build,
            // return a basic axios instance without interceptors that use AsyncStorage.
            // Or, you could throw an error if client usage is expected on server.
            console.warn("Creating a basic Axios instance for server-side or non-browser context.");
            axiosInstance = axios.create({
                baseURL: API_BASE_URL,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
    return axiosInstance;
};

export const setAxiosDependencies = (reduxDispatch, expoRouter) => {
    dispatch = reduxDispatch;
    router = expoRouter;
    // It's also a good idea to ensure the client is initialized when dependencies are set,
    // especially if this is done early on the client side.
    if (!axiosInstance && ((Platform.OS === 'web' && typeof window !== 'undefined') || Platform.OS !== 'web')) {
        getAxiosClient(); // Initialize if not already
    }
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