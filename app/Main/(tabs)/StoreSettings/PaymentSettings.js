// app/StoreSettings/GstSettings.js

import React, { useState } from "react";
import {View, StyleSheet, Alert} from "react-native";
import { Text, List, Button, useTheme, Checkbox } from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";
import { useRouter } from "expo-router";
import axiosClient from "../../../../api/client";
// import GstRateDropdown from "../../../../components/GstRateDropdown";
import {setStoreSettings} from "../../../../store/storeSettingsSlice";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
// import GstSettingsComponent from "../../../../components/GstSettingsComponent"; // Assuming this exists

export default function PaymentSettingsScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();
    const { storeId } = useSelector((state) => state.store);
    const [resultMessage, setResultMessage] = useState("");

    const handleConnect = async () => {

        let authorizationUrl;
        const redirectUri = 'https://merchant.rocketshop.in/razorpay/authCallback';
        try {
            const {data} = await axiosClient.get(`/razorpay/initiateOAuth?storeId=${storeId}`)
            authorizationUrl  = data.authorizationUrl ;
        } catch (error) {
            console.log('Failed to initiate auth with Razorpay.');
            return
        }

        // --- Step 2: Open the Expo WebBrowser for OAuth flow ---
        console.log("Opening WebBrowser session...");
        const browserResult = await WebBrowser.openAuthSessionAsync(
            authorizationUrl,
            redirectUri // Expo WebBrowser listens for this specific redirect
        );
        console.log("WebBrowser session returned:", browserResult.type);

        // --- Add this logging back ---
        console.log(">>> WebBrowser session returned:", JSON.stringify(browserResult, null, 2));

        if (browserResult.type === 'success') {
            const redirectedUrl = browserResult.url;
            console.log("Successful redirect URL:", redirectedUrl);

            // Parse the URL to extract code and state
            const { queryParams } = Linking.parse(redirectedUrl);

            if (queryParams?.code && queryParams?.state) {
                // SUCCESS! We have the authorization code and state.
                const code = queryParams.code;
                const receivedState = queryParams.state;
                console.log("Extracted Code:", code);
                console.log("Extracted State:", receivedState);
                setResultMessage(`Successfully received auth code. State: ${receivedState}`); // Update UI

                // --- IMPORTANT SECURITY STEP ---
                // The 'receivedState' MUST be verified. Usually, you send BOTH the 'code'
                // and 'receivedState' to your backend. Your backend retrieves the original
                // state associated with the user/store (from the oauth_states table based
                // on session/user info) and compares them. Proceed ONLY if they match.
                console.warn("SECURITY TODO: Implement state verification on backend before exchanging code!");

                // --- NEXT STEP: Exchange the code for tokens ---
                // Send the 'code' and 'receivedState' to your backend exchange endpoint
                console.log("Next step: Send code and state to backend for token exchange.");
                setResultMessage("Next step: Send code and state to backend for token exchange.");
                const exchangeResponse = await axiosClient.post(`/razorpay/exchangeCodeForTokens`, {
                    code,
                    state: receivedState,
                    storeId,
                })
                if (!exchangeResponse.data.success) {
                    throw new Error(exchangeResponse.data.error || `Server error: ${exchangeResponse.status}`);
                }

                console.log("Token exchange successful:", exchangeResponse.data);
                setResultMessage("Razorpay account connected successfully!"); // Display success message from backend


            } else {
                // Handle cases where redirect happened but code/state were missing
                throw new Error("Authorization redirect successful, but code or state parameter missing in URL.");
            }
        } else if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
            console.log("Browser session cancelled or dismissed by user.");
            // --- Improved Message ---
            Alert.alert(
                "Connection Incomplete",
                "The Razorpay connection process wasn't completed. If you just signed up or submitted documents with Razorpay, your account might be under review.\n\nPlease wait for confirmation from Razorpay that your account is active, then try connecting again.",
                [{ text: "OK" }]
            );
            setResultMessage("Connection pending Razorpay account activation."); // Update UI state
            // --- End Improved Message ---
            } else {
            // Handle other errors (e.g., browserResult.type === 'error')
            console.error("Authentication failed or resulted in unexpected status:", browserResult);
            Alert.alert(
                "Connection Error",
                `An unexpected error occurred during the connection process (${browserResult.type}). Please try again later.`,
                [{ text: "OK" }]
            );
            setResultMessage(`Connection failed: ${browserResult.type}`);
            }

    };

    return (
        <View style={styles.container}>
            <View style={{ marginTop: 32, flexDirection: "row", justifyContent: "space-between" }}>
                <Button mode="contained" onPress={handleConnect} style={{  borderRadius: 8 }}>
                    Connect New Or Existing Razorpay Account
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: "white",
    },
    listItem: {
        paddingHorizontal: 0,
    },
});