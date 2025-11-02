// app/razorpay/authCallback.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { getAxiosClient } from '../../api/client'; // Adjust path as needed
import * as WebBrowser from 'expo-web-browser';
import { setOAuthState } from '../../store/razorpaySlice'; // Adjust path as needed
import { useQueryClient } from "react-query";

export default function RazorpayAuthCallback() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    const { storeId } = useSelector((state) => state.store);
    const { oauthState: originalStateFromMobileRedux } = useSelector((state) => state.razorpay); // Used by mobile path

    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('Processing Razorpay connection...'); // For mobile/non-popup UI
    const [error, setError] = useState(''); // For mobile/non-popup UI
    const [hasProcessedCallback, setHasProcessedCallback] = useState(false);

    const codeFromParams = params?.code;
    const receivedStateFromParams = params?.state;
    const callbackErrorFromParams = params?.error;
    const callbackErrorDescFromParams = params?.error_description;

    const isWebPopup = Platform.OS === 'web' && typeof window !== 'undefined' && window.opener && window.opener !== window && window.opener.origin === window.location.origin;

    useEffect(() => {
        if (hasProcessedCallback) return;
        setHasProcessedCallback(true); // Process only once

        // --- Web Popup Logic: Just pass data to opener and close ---
        if (isWebPopup) {
            setIsLoading(true); // Keep loading until closed
            if (callbackErrorFromParams) {
                console.log("[AuthCallback Web Popup] Posting error to opener:", { callbackErrorFromParams, callbackErrorDescFromParams });
                window.opener.postMessage({
                    type: 'RAZORPAY_OAUTH_POPUP_DATA',
                    error: callbackErrorFromParams,
                    error_description: callbackErrorDescFromParams
                }, window.location.origin);
            } else if (codeFromParams && receivedStateFromParams) {
                console.log("[AuthCallback Web Popup] Posting code and state to opener:", { codeFromParams, receivedStateFromParams });
                window.opener.postMessage({
                    type: 'RAZORPAY_OAUTH_POPUP_DATA',
                    code: codeFromParams,
                    receivedStateFromPopup: receivedStateFromParams,
                    storeId: storeId // Pass storeId along if opener needs it directly
                }, window.location.origin);
            } else {
                console.log("[AuthCallback Web Popup] Missing critical params, posting error to opener.");
                window.opener.postMessage({
                    type: 'RAZORPAY_OAUTH_POPUP_DATA',
                    error: 'missing_parameters',
                    error_description: 'Code or state missing in callback to popup.'
                }, window.location.origin);
            }
            window.close(); // Close the popup
            return; // End processing for web popup
        }

        // --- Mobile App Deep Link Logic (or non-popup web, though less common for this flow) ---
        const processMobileCallback = async (authCode, authState) => {
            setIsLoading(true);
            setMessage('Verifying connection details...');

            if (!originalStateFromMobileRedux) {
                setError("Error: Could not retrieve original session state. Please try initiating the connection again.");
                Alert.alert("Security Error", "Your connection session could not be verified or has expired.");
                setIsLoading(false);
                return;
            }
            if (authState !== originalStateFromMobileRedux) {
                dispatch(setOAuthState(null));
                setError("Error: State verification failed. Possible security issue. Please restart the connection process.");
                Alert.alert("Security Error", "State mismatch detected. Please try connecting again.");
                setIsLoading(false);
                return;
            }
            dispatch(setOAuthState(null));
            setMessage('State verified. Finalizing connection...');

            try {
                const exchangeResponse = await axiosClient.post(`/razorpay/exchange-code-for-tokens`, {
                    code: authCode,
                    state: authState,
                    storeId
                });

                if (!exchangeResponse?.data?.success) {
                    throw new Error(exchangeResponse?.data?.error || `Server error during token exchange.`);
                }

                setMessage("Razorpay Account Connected!");
                setError('');
                Alert.alert("Success", "Razorpay account connected successfully!");
                queryClient.invalidateQueries(["razorpayConnection", storeId]);

                if (Platform.OS !== 'web') { // Only dismiss for actual mobile
                    try { await WebBrowser.dismissBrowser(); } catch (e) { console.warn("Could not dismiss browser", e); }
                }
                setTimeout(() => router.replace('/Main/(tabs)/StoreSettings'), 1000);

            } catch (exchangeError) {
                setError(`Failed to finalize connection: ${exchangeError.message}`);
                setMessage('');
                Alert.alert("Connection Error", `Failed to finalize connection: ${exchangeError.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (callbackErrorFromParams) {
            // Mobile error handling (popup version already returned)
            setError(`Connection failed: ${callbackErrorDescFromParams || callbackErrorFromParams}`);
            Alert.alert("Connection Failed", `Razorpay reported an error: ${callbackErrorDescFromParams || callbackErrorFromParams}`);
            setIsLoading(false);
        } else if (codeFromParams && receivedStateFromParams) {
            // Mobile processing (popup version already returned)
            processMobileCallback(codeFromParams, receivedStateFromParams);
        } else {
            // Mobile - missing params (popup version already returned)
            setError("Error: Callback parameters were not received correctly.");
            Alert.alert("Error", "Could not complete connection due to missing parameters.");
            setIsLoading(false);
        }
    }, [
        codeFromParams, receivedStateFromParams, originalStateFromMobileRedux, callbackErrorFromParams, callbackErrorDescFromParams,
        dispatch, queryClient, axiosClient, router, hasProcessedCallback, storeId, isWebPopup // Added isWebPopup
    ]);

    // Render for non-popup or while popup is processing (before close)
    return (
        <View style={styles.container}>
            {isLoading && <ActivityIndicator size="large" style={styles.loading} />}
            {/* Only show these messages if NOT a web popup that will close immediately */}
            {!isWebPopup && !isLoading && message && <Text style={styles.messageText}>{message}</Text>}
            {!isWebPopup && !isLoading && error && <Text style={styles.errorText}>{error}</Text>}
            {isWebPopup && isLoading && (
                <Text style={styles.messageText}>Finalizing Razorpay connection... This window will close automatically.</Text>
            )}
        </View>
    );
}

// --- Styles --- (Keep your existing styles)
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
        color: 'red',
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
    }
});