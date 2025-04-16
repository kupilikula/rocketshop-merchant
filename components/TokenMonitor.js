import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTokenExpired } from "@/utils/isTokenExpired";
import {Text, View} from "react-native";

const TokenMonitor = () => {
    const [isExpired, setIsExpired] = useState(null);

    useEffect(() => {
        const monitorToken = async () => {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) {
                setIsExpired(true); // No token found, consider it expired
                console.log("No token found. Token is expired.");
                return;
            }

            const expired = isTokenExpired(token);
            setIsExpired(expired);

            // Log the status to the console
            console.log(`Token is ${expired ? "expired" : "valid"}`);
        };

        // Check token status every 30 seconds
        const intervalId = setInterval(monitorToken, 30000);

        // Run once immediately on component mount
        monitorToken();

        // Clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <View style={{ position: "absolute", width: '100%', height: 20, top: 0, right: 0, padding: 10, background: isExpired ? "red" : "green" }}>
            <Text>{isExpired ? "Token Expired" : "Token Valid"}</Text>
        </View>
    );
};

export default TokenMonitor;