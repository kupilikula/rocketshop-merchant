import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, Platform, ActivityIndicator, ScrollView } from "react-native";
import { useTheme, Button, Text, Card, Title, Divider, HelperText } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import * as WebBrowser from 'expo-web-browser';
import { useMutation, useQueryClient } from 'react-query';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { getAxiosClient } from "../../../../api/client";
import { setOAuthState } from "../../../../store/razorpaySlice";
// The hook is assumed to be updated to match the new API response
import { useGetRazorpayStatus } from "../../../../api/hooks/useGetRazorpayStatus";

const IS_WEB = Platform.OS === 'web';

// --- (NEW) Reusable Display & Action Components ---

/**
 * @description Displays the status when the store is successfully linked to a Razorpay account.
 * Shows the account ID and who linked it. Provides a button to disconnect.
 */
const StatusLinked = ({ linkedAccount, onDisconnect, isDisconnecting }) => {
    const theme = useTheme();
    const styles = makeStyles(theme, IS_WEB);
    const { razorpayAccountId, ownerName } = linkedAccount;

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons name="check-decagram" size={48} color={styles.statusActivated.color} />
                <Title style={styles.connectedTitle}>Account Linked & Active</Title>
                <Text style={styles.subtitle}>This store is ready to receive payments via Razorpay.</Text>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Razorpay Account ID:</Text>
                    <Text style={styles.accountIdText} selectable>{razorpayAccountId}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Linked By:</Text>
                    <Text style={styles.detailValue}>{ownerName}</Text>
                </View>
                <Button
                    mode="outlined"
                    onPress={onDisconnect}
                    style={styles.disconnectButton}
                    labelStyle={styles.disconnectButtonText}
                    icon="link-off"
                    disabled={isDisconnecting}
                    loading={isDisconnecting}
                >
                    Disconnect Account
                </Button>
            </Card.Content>
        </Card>
    );
};

/**
 * @description Displays a message when the store is linked by another owner.
 * This is an informational-only state for the current user.
 */
const StatusLinkedByOther = ({ linkedAccount }) => {
    const theme = useTheme();
    const styles = makeStyles(theme, IS_WEB);
    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons name="information" size={48} color={theme.colors.primary} />
                <Title style={styles.mainTitle}>Account Linked By Another Owner</Title>
                <Text style={styles.subtitle}>
                    This store is connected to a Razorpay account linked by <Text style={{fontWeight: 'bold'}}>{linkedAccount.ownerName}</Text>.
                    Only the owner who linked the account can manage or disconnect it.
                </Text>
            </Card.Content>
        </Card>
    );
};

/**
 * @description The main action component for when a store is not linked.
 * It provides the primary action to connect a new account and, if available,
 * shows a list of existing accounts the user can reuse.
 */
const StatusNotLinked = ({ availableCredentials, onInitiateOAuth, onLinkExisting, isConnecting }) => {
    const theme = useTheme();
    const styles = makeStyles(theme, IS_WEB);
    const hasExistingCredentials = availableCredentials && availableCredentials.length > 0;

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons name="link-variant-plus" size={48} color={theme.colors.primary} />
                <Title style={styles.mainTitle}>Connect to Razorpay</Title>
                <Text style={styles.subtitle}>
                    Link a Razorpay account to this store to start accepting payments from your customers.
                </Text>

                {/* Primary Action: Connect a new account */}
                <Button
                    mode="contained"
                    onPress={() => onInitiateOAuth()}
                    style={styles.primaryButton}
                    disabled={isConnecting}
                    loading={isConnecting}
                    icon="link-variant"
                >
                    Connect with Razorpay
                </Button>
                <HelperText type="info" style={{textAlign: 'center', marginTop: 8}}>
                    You will be redirected to Razorpay to authorize the connection.
                </HelperText>

                {/* Secondary Action: Reuse an existing linked account */}
                {hasExistingCredentials && (
                    <>
                        <Divider style={styles.divider}><Text>OR</Text></Divider>
                        <Title style={styles.formSectionTitle}>Use an Existing Account</Title>
                        <Text style={styles.subtitle}>You have already connected the following Razorpay accounts. Link one to this store instantly.</Text>
                        {availableCredentials.map(cred => (
                            <View key={cred.credentialId} style={styles.existingCredentialRow}>
                                <MaterialCommunityIcons name="credit-card-check-outline" size={24} color={theme.colors.onSurfaceVariant} style={{marginRight: 16}} />
                                <Text style={styles.detailValue}>
                                    Account ending in ...{cred.razorpayAccountId.slice(-4)}
                                </Text>
                                <Button
                                    mode="text"
                                    onPress={() => onLinkExisting(cred.credentialId)}
                                    disabled={isConnecting}
                                >
                                    Link
                                </Button>
                            </View>
                        ))}
                    </>
                )}
            </Card.Content>
        </Card>
    );
};


// --- Main Screen Component (Refactored) ---

export default function PaymentSettingsScreen() {
    const axiosClient = getAxiosClient();
    const dispatch = useDispatch();
    const theme = useTheme();
    const styles = makeStyles(theme, IS_WEB);
    const queryClient = useQueryClient();

    const { storeId, isPlatformOwned } = useSelector((state) => state.store);
    const { oauthState: originalStateForVerification } = useSelector((state) => state.razorpay);

    // This hook is now expected to return the new data structure we designed
    const { data: paymentStatus, isLoading: isLoadingStatus, isError, error: statusError } = useGetRazorpayStatus(storeId);

    // --- API Mutations (Refactored) ---

    // Generic mutation hook for actions that just need to refetch status on success
    const useSimpleMutation = (mutationFn, { successMsg, errorMsg }) => {
        return useMutation(mutationFn, {
            onSuccess: () => {
                Alert.alert("Success", successMsg);
                // Invalidate the query to refetch the status from the server
                queryClient.invalidateQueries(['razorpayStatus', storeId]);
            },
            onError: (err) => Alert.alert("Error", `${errorMsg}: ${err.response?.data?.error || err.message}`),
        });
    };

    // REFACTORED: Changed to a GET request with no body
    const { mutate: initiateOAuth, isLoading: isInitiatingOAuth } = useMutation(
        async () => {
            const platform = IS_WEB ? 'web' : 'mobile';
            // Simple env detection
            const env = __DEV__ ? 'local' : (process.env.EXPO_PUBLIC_APP_ENV === 'development' ? 'qa' : 'production');
            const queryParams = new URLSearchParams({ storeId, platform, env }).toString();
            // IMPORTANT: Changed to axiosClient.get
            const { data } = await axiosClient.get(`/razorpay/initiateOAuth?${queryParams}`);
            return data;
        }, {
            onSuccess: (authParams) => {
                if (!authParams.authorizationEndpoint || !authParams.state) {
                    Alert.alert("Configuration Error", "Required auth parameters missing from server.");
                    return;
                };
                dispatch(setOAuthState(authParams.state));
                const authUrl = `${authParams.authorizationEndpoint}?response_type=code&client_id=${authParams.clientId}&redirect_uri=${authParams.redirectUri}&scope=${authParams.scopes}&state=${authParams.state}`;
                WebBrowser.openBrowserAsync(authUrl);
            },
            onError: (err) => Alert.alert("Error", `Failed to start connection: ${err.response?.data?.error || err.message}`),
        }
    );

    // NEW: Mutation to link a store to an existing credential
    const { mutate: linkToExisting, isLoading: isLinkingExisting } = useSimpleMutation(
        (credentialId) => axiosClient.post(`/stores/${storeId}/linkPaymentAccount`, { credentialId }),
        { successMsg: "Store linked successfully!", errorMsg: "Failed to link store" }
    );

    // REFACTORED: The 'disconnect' action now just unlinks the store
    const { mutate: unlinkStore, isLoading: isUnlinking } = useSimpleMutation(
        () => axiosClient.post(`/razorpay/disconnect`, { storeId }),
        { successMsg: "Razorpay account has been unlinked from this store.", errorMsg: "Failed to unlink store" }
    );

    // This logic for handling the OAuth redirect remains largely the same
    const handleOAuthMessageFromPopup = useCallback(async (event) => {
        if (event.origin !== window.location.origin || !event.data || event.data.type !== 'RAZORPAY_OAUTH_POPUP_DATA') return;

        const { code, error, error_description, receivedStateFromPopup } = event.data;

        if (error) {
            Alert.alert("Connection Failed", error_description || error);
            dispatch(setOAuthState(null));
            return;
        }

        if (!originalStateForVerification || receivedStateFromPopup !== originalStateForVerification) {
            Alert.alert("Security Error", "State mismatch detected. Please try again.");
            dispatch(setOAuthState(null));
            return;
        }
        dispatch(setOAuthState(null));

        try {
            await axiosClient.post(`/razorpay/exchangeCodeForTokens`, { code, state: receivedStateFromPopup, storeId });
            Alert.alert("Success", "Account connected! Your store is now linked.");
            queryClient.invalidateQueries(['razorpayStatus', storeId]);
        } catch (exchangeError) {
            Alert.alert("Connection Error", `Failed to finalize connection: ${exchangeError.message}`);
        }
    }, [axiosClient, dispatch, originalStateForVerification, storeId, queryClient]);

    useEffect(() => {
        if (IS_WEB) {
            window.addEventListener('message', handleOAuthMessageFromPopup);
            return () => window.removeEventListener('message', handleOAuthMessageFromPopup);
        }
    }, [handleOAuthMessageFromPopup]);


    const renderContent = () => {
        if (isLoadingStatus) {
            return <View style={styles.centeredContent}><ActivityIndicator animating={true} size="large" /></View>;
        }
        if (isError) {
            return <View style={styles.centeredContent}><Text style={styles.errorText}>Could not load payment status: {statusError.message}</Text></View>;
        }
        if (!paymentStatus) {
            return <View style={styles.centeredContent}><Text>Could not determine payment status.</Text></View>;
        }

        // The combined loading state for any action
        const isConnecting = isInitiatingOAuth || isLinkingExisting || isUnlinking;

        // NEW: Simplified rendering logic based on the new API response
        switch (paymentStatus.storeStatus) {
            case 'LINKED':
                return <StatusLinked linkedAccount={paymentStatus.linkedAccount} onDisconnect={unlinkStore} isDisconnecting={isUnlinking} />;

            case 'LINKED_BY_OTHER':
                return <StatusLinkedByOther linkedAccount={paymentStatus.linkedAccount} />;

            case 'NOT_LINKED':
                return (
                    <StatusNotLinked
                        availableCredentials={paymentStatus.availableCredentialsForUser}
                        onInitiateOAuth={initiateOAuth}
                        onLinkExisting={linkToExisting}
                        isConnecting={isConnecting}
                    />
                );

            default:
                return <View style={styles.centeredContent}><Text>Unknown payment status.</Text></View>;
        }
    };

    if (isPlatformOwned) {
        return (
            <View style={styles.container}>
                <View style={styles.centeredContent}><Text>Payment settings are managed by the platform.</Text></View>
            </View>
        );
    }

    // Wrapper logic remains the same
    const Wrapper = IS_WEB ? View : ScrollView;
    const wrapperProps = IS_WEB
        ? { style: styles.webRootContainer }
        : { style: styles.container, contentContainerStyle: styles.scrollContentContainer, keyboardShouldPersistTaps: "handled" };

    return (
        <Wrapper {...wrapperProps}>
            <View style={styles.contentWrapper}>
                {renderContent()}
            </View>
        </Wrapper>
    );
}

// --- Centralized Stylesheet (Slightly modified for new components) ---

const makeStyles = (theme, isWeb) => StyleSheet.create({
    // --- LAYOUT CONTAINERS ---
    webRootContainer: {
        flex: 1,
        backgroundColor: '#f4f5f7',
        alignItems: 'center',
        paddingVertical: 24,
    },
    container: {
        flex: 1,
        backgroundColor: isWeb ? 'transparent' : (theme.colors.background || "#f4f5f7"),
    },
    scrollContentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 600, // Reduced max-width for a more focused view
        alignSelf: 'center',
        padding: isWeb ? 0 : 16, // No padding on web, card has it
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    // --- CARD & CONTENT ---
    card: {
        elevation: isWeb ? 2 : 0,
        borderRadius: isWeb ? 12 : 8,
        borderWidth: isWeb ? 1 : 0,
        borderColor: '#e0e0e0',
        backgroundColor: 'white'
    },
    cardContent: {
        padding: isWeb ? 32 : 24,
        alignItems: 'center',
    },

    // --- TYPOGRAPHY & TEXT ---
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
        maxWidth: 450,
    },
    connectedTitle: {
        marginBottom: 4,
        textAlign: 'center',
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontSize: 22,
        marginTop: 16,
    },
    formSectionTitle: { // Reused for "Existing Account" title
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 8,
    },

    // --- BUTTONS ---
    primaryButton: {
        borderRadius: 8,
        paddingVertical: 6,
        width: '100%',
    },
    disconnectButton: {
        marginTop: 24,
        borderColor: theme.colors.error,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 6,
        width: '100%',
    },
    disconnectButtonText: {
        color: theme.colors.error,
        fontWeight: 'bold'
    },

    // --- STATUS & DETAILS ---
    divider: {
        marginVertical: 24,
        width: '100%',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
        paddingHorizontal: 8,
    },
    detailLabel: {
        fontSize: 15,
        color: theme.colors.onSurfaceVariant,
        marginRight: 8,
    },
    detailValue: {
        fontSize: 15,
        color: theme.colors.onSurface,
        flexShrink: 1,
        textAlign: 'right',
        fontWeight: 'bold'
    },
    accountIdText: {
        fontSize: 15,
        color: theme.colors.onSurface,
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        flexShrink: 1,
        textAlign: 'right',
    },
    statusActivated: {
        color: theme.colors.success || 'green',
    },
    existingCredentialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 8,
    },

    // --- ERROR STYLES ---
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
        fontWeight: 'bold'
    },
});