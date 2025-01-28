import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


const BASE_URL = "https://api.merchant.pocketshop.in"; // Replace with your actual backend URL
export const refreshAccessToken = async () => {
    try {
        console.log("Attempting to refresh access token...");
        const response = await axios.post(
            `${BASE_URL}/auth/refreshToken`,
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