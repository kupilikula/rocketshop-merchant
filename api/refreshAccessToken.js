import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

export const refreshAccessToken = async () => {
    try {
        console.log("Attempting to refresh access token...");
        const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
        );
        const newAccessToken = response.data.accessToken;

        // Save the new token to AsyncStorage
        await AsyncStorage.setItem("accessToken", newAccessToken);

        console.log("Token refreshed successfully:", newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        throw error; // Re-throw error for further handling
    }
};