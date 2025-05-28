import React, { useState } from "react";
import { View, StyleSheet, Alert, Platform, useWindowDimensions, ActivityIndicator } from "react-native"; // Added Platform, useWindowDimensions, ActivityIndicator
import { useTheme, Button, Text, Card, Title, Divider } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router"; // Original import, kept
import * as WebBrowser from 'expo-web-browser';
import { useQueryClient } from 'react-query';

import { getAxiosClient } from "../../../../api/client";
import { setOAuthState } from "../../../../store/razorpaySlice";
import { useGetRazorpayStatus } from "../../../../api/hooks/useGetRazorpayStatus";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // For error icons


const IS_WEB = Platform.OS === 'web';

export default function PaymentSettingsScreen() {
    const axiosClient = getAxiosClient();
    const dispatch = useDispatch();
    const theme = useTheme();
    const router = useRouter(); // Original import
    const { storeId, isPlatformOwned } = useSelector((state) => state.store);
    const queryClient = useQueryClient();
    const { width: windowWidth } = useWindowDimensions(); // For makeStyles
    const styles = makeStyles(theme, IS_WEB, windowWidth); // Pass theme & IS_WEB

    const [isConnecting, setIsConnecting] = useState(false); // For connect/disconnect button loading
    const [connectError, setConnectError] = useState('');

    const {
        data: connectionStatus,
        isLoading: isLoadingStatus, // For initial status fetch
        isError: isStatusError,
        error: statusError,
        refetch: refetchStatus
    } = useGetRazorpayStatus(storeId, {
        refetchOnWindowFocus: true,
        staleTime: 5 * 60 * 1000,
    });

    const handleConnect = async () => {
        // ... Original handleConnect logic ...
        if (!storeId) { Alert.alert("Error", "Store information not available."); return; }
        setIsConnecting(true); setConnectError('Initializing connection...');
        try {
            const { data: authParams } = await axiosClient.get(`/razorpay/initiateOAuth?storeId=${storeId}`);
            if (!authParams.authorizationEndpoint || !authParams.clientId || !authParams.state || !authParams.redirectUri || !authParams.scopes) {
                throw new Error("Required auth parameters missing from server.");
            }
            dispatch(setOAuthState(authParams.state));
            const authUrl = new URL(authParams.authorizationEndpoint);
            authUrl.searchParams.append('response_type', 'code');
            authUrl.searchParams.append('client_id', authParams.clientId);
            authUrl.searchParams.append('redirect_uri', authParams.redirectUri);
            authUrl.searchParams.append('scope', authParams.scopes);
            authUrl.searchParams.append('state', authParams.state);
            setConnectError('Redirecting to Razorpay...');
            await WebBrowser.openBrowserAsync(authUrl.toString());
            setConnectError('Waiting for authorization in browser...');
        } catch (error) {
            const errMsg = `Failed to start connection: ${error.message || "Unknown error"}.`;
            Alert.alert("Error", errMsg); dispatch(setOAuthState(null)); setIsConnecting(false); setConnectError(errMsg);
        }
    };

    const handleDisconnect = async () => {
        // ... Original handleDisconnect logic ...
        Alert.alert("Confirm Disconnect", "Are you sure you want to disconnect this store from Razorpay? Payments for this store will fail.",
            [{ text: "Cancel", style: "cancel" }, { text: "Disconnect", style: "destructive", onPress: async () => {
                    setIsConnecting(true); setConnectError('');
                    try {
                        await axiosClient.post(`/stores/${storeId}/razorpay-disconnect`);
                        await queryClient.invalidateQueries({ queryKey: ['razorpayConnection', storeId] });
                        Alert.alert("Success", "Razorpay account disconnected from this store.");
                    } catch (error) {
                        const errorMsg = `Failed to disconnect: ${error.response?.data?.error || error.message || 'Unknown server error'}`;
                        setConnectError(errorMsg); Alert.alert("Error", errorMsg);
                    } finally { setIsConnecting(false); }
                }}]
        );
    };

    const renderContent = () => {
        // 1. Handle Initial Loading State for the status query
        if (isLoadingStatus) {
            // Original styles.loading was { flex: 1, justifyContent: 'center', alignItems: 'center' }
            // This ActivityIndicator will be a child of styles.container (mobile) or webMaxContentContainer_Shell (web)
            // So, it will be centered within those parent containers.
            return (
                <View style={styles.loadingOrErrorContentWrapper}>
                    <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                </View>
            );
        }

        // 2. Handle Error State for the status query itself
        if (isStatusError) {
            return (
                <View style={styles.loadingOrErrorContentWrapper}>
                    <Card style={styles.card}> {/* Card itself is styled as original */}
                        <Card.Content style={styles.content}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
                            <Title style={[styles.title, { marginTop: 10, color: theme.colors.error }]}>Error</Title>
                            <Text style={styles.errorText}>Could not load Razorpay connection status.</Text>
                            <Text style={styles.errorTextSmall}>
                                Error: {statusError?.response?.data?.error || statusError?.message || 'Unknown error'}
                            </Text>
                            <Button onPress={() => refetchStatus()} icon="refresh" style={{ marginTop: 20 }}>
                                Retry
                            </Button>
                        </Card.Content>
                    </Card>
                </View>
            );
        }

        // 3. Handle Loaded State (Connected or Disconnected)
        if (connectionStatus) {
            if (connectionStatus.isConnected) {
                const { accountId, name, email, status: rzpStatus, error: detailFetchError } = connectionStatus;
                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.content}>
                            <Title style={styles.connectedTitle}>Razorpay Account Linked</Title>
                            <Divider style={styles.divider}/>
                            <View style={styles.detailRow}><Text style={styles.detailLabel}>Platform Status:</Text><Text style={styles.connectedStatus}> Active Link</Text></View>
                            <View style={styles.detailRow}><Text style={styles.detailLabel}>Account ID:</Text><Text style={styles.accountIdText}> {accountId || 'N/A'}</Text></View>
                            {detailFetchError ? (
                                <View style={styles.detailErrorContainer}>
                                    <Text style={styles.errorText}>Could not fetch live account details:</Text>
                                    <Text style={styles.errorTextSmall}>{detailFetchError}</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Account Name:</Text><Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail"> {name || 'N/A'}</Text></View>
                                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Email:</Text><Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail"> {email || 'N/A'}</Text></View>
                                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Razorpay Status:</Text>
                                        <Text style={[styles.detailValue, rzpStatus === 'activated' ? styles.statusActivated : styles.statusOther]}>
                                            {rzpStatus ? rzpStatus.charAt(0).toUpperCase() + rzpStatus.slice(1) : 'N/A'}
                                        </Text>
                                    </View>
                                </>
                            )}
                            <Button mode="outlined" onPress={handleDisconnect} style={styles.disconnectButton} labelStyle={styles.disconnectButtonText} icon="link-off" disabled={isConnecting} loading={isConnecting}>
                                Disconnect Account
                            </Button>
                        </Card.Content>
                    </Card>
                );
            } else {
                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.content}>
                            <Title style={styles.title}>Connect Razorpay Account</Title>
                            <Text style={styles.detailText}>Link your Razorpay account to this store to enable online payments through RocketShop.</Text>
                            {isConnecting && <ActivityIndicator size="small" style={styles.inlineLoading}/>}
                            {connectError && !isConnecting && <Text style={styles.errorText}>{connectError}</Text>}
                            <Button mode="contained" onPress={handleConnect} style={styles.button} disabled={isConnecting} loading={isConnecting} icon="link-variant">
                                Connect Razorpay Account
                            </Button>
                        </Card.Content>
                    </Card>
                );
            }
        }
        return <View style={styles.loadingOrErrorContentWrapper}><Text>Could not determine connection status.</Text></View>; // Fallback
    };

    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <View style={styles.webMaxContentContainer_Shell}>
                    {isPlatformOwned ? <View style={styles.loadingOrErrorContentWrapper}><Text variant="titleMedium">Payment settings are managed by the platform for this store.</Text></View> : renderContent()}
                </View>
            </View>
        );
    } else { // Mobile
        return (
            <View style={styles.container}> {/* Original mobile root */}
                {isPlatformOwned ? <View style={styles.loadingOrErrorContentWrapper}><Text variant="titleMedium">Payment settings are managed by the platform for this store.</Text></View> : renderContent()}
            </View>
        );
    }
}

const makeStyles = (theme, isWeb, windowWidth) => {
    // const { colors } = theme; // Original styles used theme.colors directly
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container: { // For the root View on MOBILE
            padding: 16,
            flex: 1,
            backgroundColor: "white", // Original
            // If loading/error content (which is now wrapped) needs to be centered:
            // justifyContent: 'center', // To center a single child vertically
            // alignItems: 'center', // To center a single child horizontally
        },
        card: { // Original style
            elevation: isWeb ? 2 : 0, // Add subtle elevation for web cards
            width: '100%', // Ensure card takes full width of its container
            marginBottom: 16, // Add some margin between cards if there were multiple
            backgroundColor: "white",
        },
        content: { // Original style
            alignItems: 'center',
            paddingVertical: 16, // Add some vertical padding inside card content
        },
        title: { // Original style
            marginBottom: 16, // Increased margin
            textAlign: 'center',
            fontWeight: 'bold', // Make titles bolder
        },
        connectedTitle: { // Added for connected state
            marginBottom: 10,
            textAlign: 'center',
            fontWeight: 'bold',
            color: theme.colors.primary, // Use primary color
        },
        divider: { // Original style
            marginVertical: 15,
            width: '90%',
            backgroundColor: theme.colors.outlineVariant, // Use theme color
        },
        detailRow: { // Original style
            flexDirection: 'row',
            justifyContent: 'flex-start', // Better for key-value pairs
            alignItems: 'center',
            marginBottom: 8,
            width: '100%', // Make detail rows take full card width
            paddingHorizontal: 8, // Add some padding
            flexWrap: 'wrap',
        },
        detailLabel: { // Original style
            fontSize: 15,
            color: theme.colors.onSurfaceVariant, // Themed color
            marginRight: 8, // Space after label
            fontWeight: 'bold',
        },
        detailText: { // Original style
            fontSize: 14,
            color: theme.colors.onSurface, // Themed color
            textAlign: 'center',
            marginBottom: 20,
            paddingHorizontal: 10,
        },
        detailValue: { // Added for consistency
            fontSize: 15,
            color: theme.colors.onSurface,
            flexShrink: 1, // Allow value to shrink/wrap
            textAlign: 'left', // Align value text to left
        },
        connectedStatus: { // Original style
            fontSize: 15,
            color: theme.colors.success, // Themed color
            fontWeight: 'bold',
        },
        accountIdText: { // Original style
            fontSize: 15,
            color: theme.colors.onSurface, // Themed color
            fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        },
        // buttonContainer: { // Original style, not directly used for individual buttons
        //     marginTop: 20,
        //     width: '100%',
        //     alignItems: 'center',
        // },
        button: { // Original style
            borderRadius: 8,
            paddingVertical: 6,
            width: IS_WEB ? 'auto' : '90%', // Web buttons can be auto width
            minWidth: IS_WEB ? 250 : undefined, // Min width for web buttons
            alignSelf: 'center', // Ensure button itself is centered if width is auto
        },
        disconnectButton: { // Original style
            marginTop: 20,
            borderColor: theme.colors.error, // Themed color
            borderWidth: 1,
            borderRadius: 8,
            paddingVertical: 6,
            width: IS_WEB ? 'auto' : '90%',
            minWidth: IS_WEB ? 250 : undefined,
            alignSelf: 'center',
        },
        disconnectButtonText: { // Original style
            color: theme.colors.error, // Themed color
        },
        loading: { // Original style, intended for ActivityIndicator itself if it takes flex:1
            flex: 1, // If this style is on a View wrapper, it will center AI.
            justifyContent: 'center',
            alignItems: 'center',
        },
        inlineLoading: { // Original style
            marginVertical: 10,
        },
        errorText: { // Original style
            color: theme.colors.error, // Themed color
            textAlign: 'center',
            marginVertical: 10,
            fontSize: 14,
        },
        errorTextSmall: { // Added
            color: theme.colors.error,
            textAlign: 'center',
            fontSize: 12,
            marginTop: 4,
        },
        statusActivated: { color: theme.colors.success, fontWeight: 'bold' },
        statusOther: { color: theme.colors.onSurfaceVariant },
        detailErrorContainer: { marginVertical:10, padding:10, backgroundColor: theme.colors.errorContainer, borderRadius: theme.roundness, alignItems: 'center' },


        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
            paddingVertical: IS_WEB ? 20 : 0, // Add some overall page padding for web
        },
        webMaxContentContainer_Shell: {
            width: '100%',
            maxWidth: 768, // Max width for settings content
            flex: 1, // Important if content can be shorter than viewport and needs centering
            backgroundColor: 'white', // Matches mobile container background
            padding: 16, // Matches mobile container padding
            borderRadius: IS_WEB ? 8 : 0, // Optional: rounded corners for the shell on web
            // If the shell itself needs to center its direct child (the result of renderContent()):
            // justifyContent: 'center',
            // alignItems: 'center',
        },
        // --- Wrapper for loading/error content (replaces styles.loading when used on a View) ---
        loadingOrErrorContentWrapper: {
            flex: 1, // If parent has fixed height or is flex container
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%', // Takes width of parent (styles.container or webMaxContentContainer_Shell)
            padding: 20,
        }
    });
};
