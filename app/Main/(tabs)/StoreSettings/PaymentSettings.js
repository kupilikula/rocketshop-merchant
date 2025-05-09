// app/StoreSettings/PaymentSettingsScreen.js (or appropriate file)

import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useTheme, Button, ActivityIndicator, Text, Card, Title, Divider } from "react-native-paper"; // Added Card, Title, Divider
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { useQueryClient } from 'react-query'; // Import RQ hooks

import axiosClient from "../../../../api/client"; // <<< ADJUST PATH
import { setOAuthState } from "../../../../store/razorpaySlice"; // <<< ADJUST PATH
import { useGetRazorpayStatus } from "../../../../api/hooks/useGetRazorpayStatus"; // <<< ADJUST PATH & Ensure this hook file exists

export default function PaymentSettingsScreen() {
    const dispatch = useDispatch();
    const theme = useTheme();
    const router = useRouter();
    const { storeId, isPlatformOwned } = useSelector((state) => state.store);
    const queryClient = useQueryClient(); // Get query client instance for invalidation

    // State specifically for the 'Connect' button action flow
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectError, setConnectError] = useState('');

    // --- Use the custom hook to fetch current connection status ---
    const {
        data: connectionStatus, // Shape: { isConnected: boolean, accountId: string | null }
        isLoading: isLoadingStatus, // Loading state for the status query itself
        isError: isStatusError,
        error: statusError,
        refetch: refetchStatus // Can use this to manually trigger refetch if needed
    } = useGetRazorpayStatus(storeId, {
        // React Query options:
        refetchOnWindowFocus: true, // Auto-refreshes when screen focused (good after redirect)
        staleTime: 5 * 60 * 1000,   // Data considered fresh for 5 minutes
    });

    // --- Handle Connect Button Press ---
    // This function *initiates* the OAuth flow
    const handleConnect = async () => {
        if (!storeId) {
            Alert.alert("Error", "Store information not available.");
            return;
        }
        setIsConnecting(true); // Start loading specifically for the connect action
        setConnectError('Initializing connection...');

        let authParams;
        try {
            // 1. Fetch Auth Parameters (including state and backend callback URL)
            console.log('[handleConnect] Fetching auth parameters...');
            const { data } = await axiosClient.get(`/razorpay/initiateOAuth?storeId=${storeId}`);
            if (!data.authorizationEndpoint || !data.clientId || !data.state || !data.redirectUri || !data.scopes) {
                throw new Error("Required auth parameters missing from server.");
            }
            authParams = data;
            console.log("[handleConnect] Received parameters. State:", authParams.state.substring(0,5)+"...");

            // 2. Store State locally/globally for later verification in callback screen
            dispatch(setOAuthState(authParams.state));
            console.log("[handleConnect] Original OAuth state stored.");

            // 3. Construct Auth URL for Razorpay
            const authUrl = new URL(authParams.authorizationEndpoint);
            authUrl.searchParams.append('response_type', 'code');
            authUrl.searchParams.append('client_id', authParams.clientId);
            authUrl.searchParams.append('redirect_uri', authParams.redirectUri); // Backend callback URL
            authUrl.searchParams.append('scope', authParams.scopes);
            authUrl.searchParams.append('state', authParams.state);
            const finalAuthUrl = authUrl.toString();
            console.log("[handleConnect] Constructed Authorization URL:", finalAuthUrl);

            // 4. Open Browser (Fire and Forget - result handled by deep link)
            console.log("[handleConnect] Opening browser (openBrowserAsync)...");
            setConnectError('Redirecting to Razorpay...');
            await WebBrowser.openBrowserAsync(finalAuthUrl);
            console.log("[handleConnect] Browser opened. Waiting for app to reopen via deep link callback...");
            setConnectError('Waiting for authorization in browser...');
            // Keep isConnecting = true; The UI will update automatically when the
            // connectionStatus query refetches after the callback screen invalidates it.

        } catch (error) {
            console.error('[handleConnect] Error:', error);
            const errMsg = `Failed to start connection: ${error.message || "Unknown error"}.`;
            Alert.alert("Error", errMsg);
            dispatch(setOAuthState(null)); // Clear state on error
            setIsConnecting(false); // Stop connect-specific loading on error
            setConnectError(errMsg);
        }
        // We don't set isConnecting=false on success here
    };

    // --- Handle Disconnect Button Press ---
    const handleDisconnect = async () => {
        Alert.alert(
            "Confirm Disconnect",
            "Are you sure you want to disconnect this store from Razorpay? Payments for this store will fail.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Disconnect",
                    style: "destructive",
                    onPress: async () => {
                        // Use isConnecting state for loading during disconnect too? Or add isDisconnecting state?
                        // Let's use isConnecting for simplicity for now.
                        setIsConnecting(true);
                        setConnectError('');
                        try {
                            console.log(`[handleDisconnect] Disconnecting store ${storeId}...`);
                            // *** TODO: Implement this backend endpoint ***
                            // It should securely verify the user has permission and then
                            // delete the row from 'store_razorpay_links' for this storeId.
                            await axiosClient.post(`/stores/${storeId}/razorpay-disconnect`);
                            console.log(`[handleDisconnect] Disconnect successful on backend.`);

                            // --- Invalidate query cache to force UI update ---
                            await queryClient.invalidateQueries({ queryKey: ['razorpayConnection', storeId] });
                            Alert.alert("Success", "Razorpay account disconnected from this store.");

                        } catch (error) {
                            console.error(`[handleDisconnect] Failed for store ${storeId}:`, error);
                            const errorMsg = `Failed to disconnect: ${error.response?.data?.error || error.message || 'Unknown server error'}`;
                            setConnectError(errorMsg)
                            Alert.alert("Error", errorMsg);
                        } finally {
                            setIsConnecting(false); // Stop loading indicator
                        }
                    }
                }
            ]
        );
    };

    // --- Render Logic ---
    const renderContent = () => {
        // 1. Handle Initial Loading State for the status query
        // isRefetching might be useful if you want a subtler indicator during background updates
        if (isLoadingStatus) {
            return <ActivityIndicator animating={true} size="large" style={styles.loading} />;
        }

        // 2. Handle Error State for the status query itself
        if (isStatusError) {
            return (
                <Card style={styles.card}>
                    <Card.Content style={styles.content}>
                        <Title style={styles.title}>Error</Title>
                        <Text style={styles.errorText}>
                            Could not load Razorpay connection status.
                        </Text>
                        <Text style={styles.errorTextSmall}>
                            Error: {statusError?.response?.data?.error || statusError?.message || 'Unknown error'}
                        </Text>
                        <Button onPress={() => refetchStatus()} icon="refresh" style={{ marginTop: 15 }}>
                            Retry
                        </Button>
                    </Card.Content>
                </Card>
            );
        }

        // 3. Handle Loaded State (Connected or Disconnected)
        // We should have connectionStatus data here (even if it's the placeholder)
        if (connectionStatus) {
            if (connectionStatus.isConnected) {
                // --- RENDER CONNECTED STATE ---
                const { accountId, name, email, status: rzpStatus, error: detailFetchError } = connectionStatus;

                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.content}>
                            <Title style={styles.connectedTitle}>Razorpay Account Linked</Title>
                            <Divider style={styles.divider}/>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Platform Status:</Text>
                                <Text style={styles.connectedStatus}> Active Link</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Account ID:</Text>
                                <Text style={styles.accountIdText}> {accountId || 'N/A'}</Text>
                            </View>

                            {/* Display details fetched from Razorpay OR an error if fetch failed */}
                            {detailFetchError ? (
                                <View style={styles.detailErrorContainer}>
                                    <Text style={styles.errorText}>Could not fetch live account details:</Text>
                                    <Text style={styles.errorTextSmall}>{detailFetchError}</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Account Name:</Text>
                                        <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail"> {name || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Email:</Text>
                                        <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail"> {email || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Razorpay Status:</Text>
                                        {/* Example conditional styling for status */}
                                        <Text style={[
                                            styles.detailValue,
                                            rzpStatus === 'activated' ? styles.statusActivated : styles.statusOther
                                        ]}>
                                            {rzpStatus ? rzpStatus.charAt(0).toUpperCase() + rzpStatus.slice(1) : 'N/A'}
                                        </Text>
                                    </View>
                                </>
                            )}

                            {/* Disconnect Button */}
                            <Button
                                mode="outlined"
                                onPress={handleDisconnect} // Ensure this function is defined
                                style={styles.disconnectButton}
                                labelStyle={styles.disconnectButtonText}
                                icon="link-off"
                                disabled={isConnecting || isLoadingStatus} // Disable during any loading
                                loading={isConnecting} // Show loading only for connect/disconnect actions
                            >
                                Disconnect Account
                            </Button>
                        </Card.Content>
                    </Card>
                );
            } else {
                // --- RENDER DISCONNECTED STATE ---
                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.content}>
                            <Title style={styles.title}>Connect Razorpay Account</Title>
                            <Text style={styles.detailText}>Link your Razorpay account to this store to enable online payments through RocketShop.</Text>
                            {/* Show indicator/message only when connect action is running */}
                            {isConnecting && <ActivityIndicator size="small" style={styles.inlineLoading}/>}
                            {connectError && <Text style={styles.errorText}>{connectError}</Text>}
                            <Button
                                mode="contained"
                                onPress={handleConnect} // Ensure this function is defined
                                style={styles.button}
                                disabled={isConnecting || isLoadingStatus} // Disable if fetching status or connecting
                                loading={isConnecting}
                                icon="link-variant"
                            >
                                Connect Razorpay Account
                            </Button>
                        </Card.Content>
                    </Card>
                );
            }
        }

        // Fallback if data structure is unexpected after loading finishes
        return <Text>Could not determine connection status.</Text>;
    }; // end renderContent

    return (
        // Using a ScrollView might be better if content grows

        <View style={styles.container}>
            {isPlatformOwned ? null : renderContent()}
        </View>
    );
}

// --- Styles --- (Added more specific styles)
const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: "white", // Consider using theme.colors.background
    },
    card: {
        // elevation: 2, // Add shadow if desired
    },
    content: {
        alignItems: 'center', // Center content within card
    },
    title: {
        marginBottom: 10,
        textAlign: 'center',
    },
    divider: {
        marginVertical: 15,
        width: '90%',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 15,
        color: '#666', // Use theme colors
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    connectedStatus: {
        fontSize: 15,
        color: 'green', // Use theme success color
        fontWeight: 'bold',
    },
    accountIdText: {
        fontSize: 15,
        color: '#333',
        fontFamily: 'monospace', // Example for account ID
    },
    buttonContainer: { // Used within Card now
        marginTop: 20,
        width: '100%', // Make button take available width
        alignItems: 'center',
    },
    button: {
        borderRadius: 8,
        paddingVertical: 6,
        width: '90%', // Example width
    },
    disconnectButton: {
        marginTop: 20,
        borderColor: '#B00020', // Material Design error color
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 6,
        width: '90%', // Example width
    },
    disconnectButtonText: {
        color: '#B00020', // Match border color
    },
    loading: { // For the main status loading
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inlineLoading: { // For the button action loading
        marginVertical: 10,
    },
    errorText: {
        color: 'red', // Use theme.colors.error
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
    }
});