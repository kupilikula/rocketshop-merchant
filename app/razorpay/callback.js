// app/razorpay/authCallback.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux'; // Added useDispatch
import axiosClient from '../../api/client'; // Adjust path as needed
import * as WebBrowser from 'expo-web-browser'; // Needed for dismissBrowser
import { setOAuthState } from '../../store/razorpaySlice';
import {useQueryClient} from "react-query"; // Import action to store/clear state (ADJUST PATH)

export default function RazorpayAuthCallback() {
    // Get query params passed via the deep link (e.g., from rocketshopmerchant://oauth/callback?code=...)
    const params = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const {storeId} = useSelector((state) => state.store);
    // Retrieve original state stored *before* opening browser
    const { oauthState: originalState } = useSelector((state) => state.razorpay); // Ensure 'razorpay.oauthState' is correct path

    // --- Component State ---
    const [isLoading, setIsLoading] = useState(true); // Assume loading initially
    const [message, setMessage] = useState('Processing Razorpay connection...');
    const [error, setError] = useState('');
    const [hasProcessedCallback, setHasProcessedCallback] = useState(false); // Prevent double processing

    // Extract potential parameters from the deep link URL
    const code = params?.code;
    const receivedState = params?.state;
    const callbackError = params?.error; // Check if Razorpay sent back an error via backend redirect
    const callbackErrorDesc = params?.error_description;

    useEffect(() => {
        // Core logic function
        const handleCallback = async (authCode, authState) => {
            setIsLoading(true); // Ensure loading is true
            setError('');
            setMessage('Verifying connection details...');
            console.log('[DeepLink Callback] Handling callback...', { authCode, authState });

            // --- Verify State ---
            if (!originalState) {
                setError("Error: Could not retrieve original session state. Please try initiating the connection again.");
                Alert.alert("Security Error", "Your connection session could not be verified or has expired.");
                setIsLoading(false);
                return;
            }
            if (authState !== originalState) {
                console.error("[DeepLink Callback] State mismatch!", { received: authState, expected: originalState });
                dispatch(setOAuthState(null)); // Clear potentially invalid state
                setError("Error: State verification failed. Possible security issue. Please restart the connection process.");
                Alert.alert("Security Error", "State mismatch detected. Please try connecting again.");
                setIsLoading(false);
                return;
            }
            console.log("[DeepLink Callback] State verified successfully.");
            dispatch(setOAuthState(null)); // --- Clear state after successful verification ---
            setMessage('State verified. Finalizing connection...');
            // --- End State Verification ---

            try {
                // --- Exchange Code for Tokens ---
                console.log("[DeepLink Callback] Sending code and state to backend...");
                // *** NOTE: Removed storeId from the payload ***
                const exchangeResponse = await axiosClient.post(`/razorpay/exchangeCodeForTokens`, {
                    code: authCode,
                    state: authState, // Send state for backend lookup/verification
                });

                if (!exchangeResponse?.data?.success) {
                    throw new Error(exchangeResponse?.data?.error || `Server error ${exchangeResponse?.status || ''} during token exchange.`);
                }
                // --- End Exchange ---

                console.log("[DeepLink Callback] Token exchange successful.");
                setMessage("Razorpay Account Connected!");
                setError('');
                Alert.alert("Success", "Razorpay account connected successfully!");

                // --- Attempt to dismiss browser AFTER success ---
                try {
                    console.log("[DeepLink Callback] Attempting to dismiss browser...");
                    await WebBrowser.dismissBrowser();
                    console.log("[DeepLink Callback] Dismiss browser call finished.");
                } catch (dismissError) {
                    console.warn("[DeepLink Callback] Could not dismiss browser:", dismissError);
                }
                // --- End dismiss attempt ---

                // Navigate away after a short delay
                setTimeout(() => {
                        // Navigate to a relevant screen, e.g., back to settings or dashboard
                    router.replace('/Main/(tabs)/StoreSettings'); // Example
                }, 1000); // Short delay

            } catch (exchangeError) {
                console.error("[DeepLink Callback] Token exchange failed:", exchangeError);
                const errorMsg = `Failed to finalize connection: ${exchangeError.message}`;
                setError(errorMsg);
                setMessage('');
                Alert.alert("Connection Error", errorMsg);
                // Stay on this screen to show error, don't navigate away
            } finally {
                setIsLoading(false); // Stop loading indicator
                queryClient.invalidateQueries(["razorpayConnection", storeId])
            }
        }; // --- End handleCallback ---

        // --- Effect Execution Logic ---
        // Check for direct errors first, only run once
        if (callbackError && !hasProcessedCallback) {
            setHasProcessedCallback(true); // Mark as processed
            console.error(`[DeepLink Callback] Error received from redirect: ${callbackError} - ${callbackErrorDesc}`);
            setError(`Connection failed: ${callbackErrorDesc || callbackError}`);
            Alert.alert("Connection Failed", `Razorpay reported an error: ${callbackErrorDesc || callbackError}`);
            setIsLoading(false);
        }
        // If no error and we have code/state and haven't processed yet
        else if (code && receivedState && !hasProcessedCallback) {
            setHasProcessedCallback(true); // Mark as processed
            handleCallback(code, receivedState);
        }
        // Handle case where component mounts but params are missing without an error reported
        else if (!hasProcessedCallback && (!code || !receivedState)) {
            console.warn("[DeepLink Callback] Code or state missing on mount/render.");
            // If still loading, wait briefly, otherwise show error
            if (!isLoading) {
                setError("Error: Callback parameters were not received correctly.");
                Alert.alert("Error", "Could not complete connection due to missing parameters.");
            }
            // Optionally add a timeout to stop loading if params never arrive
            // setTimeout(() => { if(isLoading) setIsLoading(false); }, 3000);
        }
        // --- End Effect Execution Logic ---

        // Dependencies: React to changes in the extracted params or the original state from redux
        // Adding storeId shouldn't be necessary unless used elsewhere in component
    }, [code, receivedState, originalState, router, hasProcessedCallback, dispatch, callbackError, callbackErrorDesc]);

    // --- Render ---
    return (
        <View style={styles.container}>
            {isLoading && <ActivityIndicator size="large" style={styles.loading} />}
            {!isLoading && message && <Text style={styles.messageText}>{message}</Text>}
            {!isLoading && error && <Text style={styles.errorText}>{error}</Text>}
            {/* This screen usually just shows status, no interactive elements */}
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    loading: {
        marginVertical: 20,
    },
    messageText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
        color: '#333',
    },
    errorText: {
        color: 'red', // Use theme.colors.error if available
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
    }
});