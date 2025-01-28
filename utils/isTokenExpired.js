import {jwtDecode} from "jwt-decode";

export const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Current time in seconds
        return decoded.exp < currentTime; // Compare token expiry with the current time
    } catch (error) {
        console.error("Error decoding token:", error);
        return true; // If there's an error decoding, assume the token is expired
    }
};