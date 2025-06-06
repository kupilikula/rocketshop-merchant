import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    StyleSheet,
    Alert,
    Platform,
    useWindowDimensions,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView
} from "react-native";
import { useTheme, Button, Text, Card, Title, Divider, TextInput, HelperText } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { useQueryClient } from 'react-query';

import { getAxiosClient } from "../../../../api/client"; // Adjust path if needed
import { setOAuthState } from "../../../../store/razorpaySlice"; // Adjust path if needed
import { useGetRazorpayStatus } from "../../../../api/hooks/useGetRazorpayStatus"; // Adjust path if needed
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const IS_WEB = Platform.OS === 'web';

export default function PaymentSettingsScreen() {
    const axiosClient = getAxiosClient();
    const dispatch = useDispatch();
    const theme = useTheme();
    const router = useRouter();
    const { storeId, isPlatformOwned } = useSelector((state) => state.store);
    const { oauthState: originalStateForVerification } = useSelector((state) => state.razorpay);
    const queryClient = useQueryClient();
    const { width: windowWidth } = useWindowDimensions();
    const styles = makeStyles(theme, IS_WEB, windowWidth);

    const [isConnecting, setIsConnecting] = useState(false);
    const [connectError, setConnectError] = useState('');

    // --- State for all form details ---
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [stakeholderName, setStakeholderName] = useState('');
    const [stakeholderEmail, setStakeholderEmail] = useState('');
    const [stakeholderPan, setStakeholderPan] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const {
        data: connectionStatus,
        isLoading: isLoadingStatus,
        isError: isStatusError,
        error: statusError,
        refetch: refetchStatus
    } = useGetRazorpayStatus(storeId, {
        refetchOnWindowFocus: true, staleTime: 5 * 60 * 1000,
        onSuccess: (data) => {
            if (!data.isConnected) {
                // Pre-fill form if backend provides existing details on a non-connected store
                setAccountNumber(data.bankDetails?.account_number || '');
                setIfscCode(data.bankDetails?.ifsc_code || '');
                setBeneficiaryName(data.bankDetails?.beneficiary_name || '');
                // Assuming status endpoint can also return pre-filled stakeholder data
                setStakeholderName(data.stakeholderDetails?.name || '');
                setStakeholderEmail(data.stakeholderDetails?.email || '');
                setStakeholderPan(data.stakeholderDetails?.pan || '');
            }
        }
    });

    const handleOAuthMessageFromPopup = useCallback(async (event) => {
        if (event.origin !== window.location.origin) { return; }
        const {data} = event;
        if (data && data.type === 'RAZORPAY_OAUTH_POPUP_DATA') {
            setIsConnecting(true); setConnectError('');
            if (data.error) {
                const errorMsg = `Razorpay connection failed: ${data.error_description || data.error}`;
                Alert.alert("Connection Failed", errorMsg);
                setConnectError(errorMsg);
                dispatch(setOAuthState(null));
                setIsConnecting(false);
                return;
            }
            const {code: receivedCode, receivedStateFromPopup} = data;
            if (!originalStateForVerification) {
                Alert.alert("Security Error", "Original session state not found. Please try again.");
                setIsConnecting(false);
                return;
            }
            if (receivedStateFromPopup !== originalStateForVerification) {
                Alert.alert("Security Error", "State mismatch detected. Please try again.");
                dispatch(setOAuthState(null));
                setIsConnecting(false);
                return;
            }
            dispatch(setOAuthState(null));
            try {
                const exchangeResponse = await axiosClient.post(`/razorpay/exchangeCodeForTokens`, {
                    code: receivedCode, state: receivedStateFromPopup, storeId
                });
                if (!exchangeResponse?.data?.success) throw new Error(exchangeResponse?.data?.error);
                Alert.alert("Success", "Razorpay account connected successfully! Setup is processing.");
                if (storeId) queryClient.invalidateQueries(["razorpayConnection", storeId]);
                refetchStatus();
            } catch (exchangeError) {
                const errorMsg = `Failed to finalize connection: ${exchangeError.message}`;
                Alert.alert("Connection Error", errorMsg);
                setConnectError(errorMsg);
            } finally {
                setIsConnecting(false);
            }
        }
    }, [axiosClient, dispatch, originalStateForVerification, queryClient, storeId, refetchStatus]);

    useEffect(() => {
        if (IS_WEB) {
            window.addEventListener('message', handleOAuthMessageFromPopup);
            return () => window.removeEventListener('message', handleOAuthMessageFromPopup);
        }
    }, [handleOAuthMessageFromPopup]);

    const validateForm = () => {
        const errors = {};
        if (!beneficiaryName.trim()) errors.beneficiaryName = "Beneficiary name is required.";
        if (!accountNumber.trim()) errors.accountNumber = "Bank account number is required.";
        if (!ifscCode.trim()) {
            errors.ifscCode = "IFSC code is required.";
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
            errors.ifscCode = "Please enter a valid 11-character IFSC code.";
        }
        if (!stakeholderName.trim()) errors.stakeholderName = "Stakeholder name is required.";
        if (!stakeholderEmail.trim()) {
            errors.stakeholderEmail = "Stakeholder email is required.";
        } else if (!/\S+@\S+\.\S+/.test(stakeholderEmail)) {
            errors.stakeholderEmail = "Please enter a valid email address.";
        }
        if (!stakeholderPan.trim()) {
            errors.stakeholderPan = "Stakeholder PAN is required.";
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(stakeholderPan.toUpperCase())) {
            errors.stakeholderPan = "Please enter a valid 10-character PAN.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConnect = async () => {
        if (!storeId) { Alert.alert("Error", "Store information not available."); return; }
        if (!validateForm()) { Alert.alert("Validation Error", "Please fill in all required fields correctly."); return; }
        setIsConnecting(true); setConnectError('');
        try {
            const platform = IS_WEB ? 'web' : 'mobile';
            let env = 'production';
            if (__DEV__) { env = 'local'; }
            else { const buildEnv = process.env.APP_ENV || 'production'; if (buildEnv === 'development') { env = 'qa'; } }

            const queryParams = new URLSearchParams({ storeId, platform, env }).toString();
            const requestBody = {
                account_number: accountNumber, ifsc_code: ifscCode, beneficiary_name: beneficiaryName,
                stakeholder_name: stakeholderName, stakeholder_email: stakeholderEmail, stakeholder_pan: stakeholderPan,
            };

            const { data: authParams } = await axiosClient.post(`/razorpay/initiateOAuth?${queryParams}`, requestBody);

            if (!authParams.authorizationEndpoint || !authParams.clientId || !authParams.state) {
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
            setConnectError('Please complete authorization in the browser window/tab.');
        } catch (error) {
            const errMsg = `Failed to start connection: ${error.response?.data?.error || error.message}.`;
            Alert.alert("Error", errMsg); dispatch(setOAuthState(null)); setIsConnecting(false); setConnectError(errMsg);
        }
    };

    const handleDisconnect = async () => {
        Alert.alert("Confirm Disconnect", "Are you sure you want to disconnect this store from Razorpay?",
            [{ text: "Cancel", style: "cancel" }, { text: "Disconnect", style: "destructive", onPress: async () => {
                    setIsConnecting(true); setConnectError('');
                    try {
                        await axiosClient.delete(`/stores/${storeId}/razorpay/connection`);
                        refetchStatus();
                        Alert.alert("Success", "Razorpay account disconnected.");
                    } catch (error) {
                        const errorMsg = `Failed to disconnect: ${error.response?.data?.error || error.message}.`;
                        setConnectError(errorMsg); Alert.alert("Error", errorMsg);
                    } finally { setIsConnecting(false); }
                }}]
        );
    };

    const renderIncompleteSetupCard = (statusData) => {
        let title = "Setup Incomplete";
        let message = "Your Razorpay account is linked, but setup is not yet complete. Please try again or contact support if the issue persists.";
        let canRetry = true;

        switch (statusData.setupStatus) {
            case 'route_account_failed': message = "We couldn't create a Route-enabled account with Razorpay. Please try connecting again."; break;
            case 'stakeholder_creation_failed': message = "We linked your account, but couldn't verify your stakeholder details. Please check your information and try again."; break;
            case 'product_request_failed': case 'product_update_failed': message = "We linked your account, but couldn't activate payouts with your bank details. Please try again."; break;
            default: title = "Setup is Processing"; message = "Your Razorpay account is linked and setup is being finalized. This can take a few moments. Please refresh in a bit."; canRetry = false; break;
        }

        return (
            <Card style={styles.card}>
                <Card.Content style={styles.content}>
                    <MaterialCommunityIcons name="progress-alert" size={48} color={theme.colors.warning || '#FFA500'} />
                    <Title style={[styles.title, { marginTop: 10 }]}>{title}</Title>
                    <Text style={styles.detailText}>{message}</Text>
                    {canRetry && ( <Button onPress={handleConnect} icon="refresh" style={{ marginTop: 20 }} disabled={isConnecting}>Retry Setup</Button> )}
                    <Button onPress={() => refetchStatus()} style={{ marginTop: 10 }} disabled={isConnecting} loading={isLoadingStatus}>Refresh Status</Button>
                    <Divider style={styles.divider} />
                    <Button mode="outlined" onPress={handleDisconnect} style={styles.disconnectButton} labelStyle={styles.disconnectButtonText} icon="link-off" disabled={isConnecting}>Disconnect and Start Over</Button>
                </Card.Content>
            </Card>
        );
    };

    const renderContent = () => {
        if (isLoadingStatus) return (<View style={styles.loadingOrErrorContentWrapper}><ActivityIndicator animating={true} size="large" color={theme.colors.primary}/></View>);
        if (isStatusError) return (<View style={styles.loadingOrErrorContentWrapper}><Card style={styles.card}><Card.Content style={styles.content}><MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error}/><Title style={[styles.title, {marginTop: 10, color: theme.colors.error}]}>Error</Title><Text style={styles.errorText}>Could not load connection status.</Text><Text style={styles.errorTextSmall}>Error: {statusError?.response?.data?.error || statusError?.message}</Text><Button onPress={() => refetchStatus()} icon="refresh" style={{marginTop: 20}}>Retry</Button></Card.Content></Card></View>);

        if (connectionStatus) {
            const { isConnected, setupStatus, linkedAccountId, name, email, status: rzpStatus, error: detailFetchError } = connectionStatus;

            if (isConnected && setupStatus === 'complete') {
                return (
                    <Card style={styles.card}>
                        <Card.Content style={styles.content}>
                            <Title style={styles.connectedTitle}>Razorpay Account Linked</Title>
                            <Text style={styles.statusComplete}>(Setup Complete & Active)</Text>
                            <Divider style={styles.divider}/>
                            <View style={styles.detailRow}><Text style={styles.detailLabel}>Route Account ID:</Text><Text style={styles.accountIdText}> {linkedAccountId || 'N/A'}</Text></View>
                            {Boolean(detailFetchError) ? (<View style={styles.detailErrorContainer}><Text style={styles.errorText}>Could not fetch live details:</Text><Text style={styles.errorTextSmall}>{detailFetchError}</Text></View>) : (<>
                                <View style={styles.detailRow}><Text style={styles.detailLabel}>Account Name:</Text><Text style={styles.detailValue} numberOfLines={1}> {name || 'N/A'}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.detailLabel}>Email:</Text><Text style={styles.detailValue} numberOfLines={1}>{email || 'N/A'}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.detailLabel}>Razorpay Status:</Text><Text style={[styles.detailValue, rzpStatus === 'activated' ? styles.statusActivated : styles.statusOther]}>{rzpStatus ? rzpStatus.charAt(0).toUpperCase() + rzpStatus.slice(1) : 'N/A'}</Text></View>
                            </>)}
                            <Button mode="outlined" onPress={handleDisconnect} style={styles.disconnectButton} labelStyle={styles.disconnectButtonText} icon="link-off" disabled={isConnecting} loading={isConnecting}>Disconnect Account</Button>
                        </Card.Content>
                    </Card>
                );
            }
            if (isConnected && setupStatus !== 'complete') {
                return renderIncompleteSetupCard(connectionStatus);
            }
            if (!isConnected) {
                return (
                    <ScrollView contentContainerStyle={{paddingBottom: 40}} keyboardShouldPersistTaps="handled">
                    <Card style={styles.card}>
                        <Card.Content style={styles.content}>
                            <Title style={styles.title}>Connect Your Payout Account</Title>
                            <Text style={styles.detailText}>Provide your business and payout details, then link your Razorpay account to start receiving payments.</Text>

                            <Divider style={styles.divider}/>
                            <Title style={styles.formSectionTitle}>Stakeholder Details</Title>
                            <Text style={styles.detailTextSmall}>Enter details for the primary business owner. Name and PAN must match official records.</Text>
                            <TextInput label="Full Name (as on PAN card)" value={stakeholderName} onChangeText={setStakeholderName} style={styles.input} mode="outlined" error={!!formErrors.stakeholderName} onBlur={validateForm} />
                            {formErrors.stakeholderName && <HelperText type="error">{formErrors.stakeholderName}</HelperText>}
                            <TextInput label="Stakeholder Email" value={stakeholderEmail} onChangeText={setStakeholderEmail} style={styles.input} mode="outlined" keyboardType="email-address" autoCapitalize="none" error={!!formErrors.stakeholderEmail} onBlur={validateForm} />
                            {formErrors.stakeholderEmail && <HelperText type="error">{formErrors.stakeholderEmail}</HelperText>}
                            <TextInput label="PAN (Permanent Account Number)" value={stakeholderPan} onChangeText={(text) => setStakeholderPan(text.toUpperCase())} style={styles.input} mode="outlined" autoCapitalize="characters" maxLength={10} error={!!formErrors.stakeholderPan} onBlur={validateForm} />
                            {formErrors.stakeholderPan && <HelperText type="error">{formErrors.stakeholderPan}</HelperText>}

                            <Divider style={styles.divider}/>
                            <Title style={styles.formSectionTitle}>Bank Account Details (for Payouts)</Title>
                            <TextInput label="Beneficiary Name (as per bank records)" value={beneficiaryName} onChangeText={setBeneficiaryName} style={styles.input} mode="outlined" error={!!formErrors.beneficiaryName} onBlur={validateForm} />
                            {formErrors.beneficiaryName && <HelperText type="error">{formErrors.beneficiaryName}</HelperText>}
                            <TextInput label="Bank Account Number" value={accountNumber} onChangeText={setAccountNumber} style={styles.input} keyboardType="number-pad" mode="outlined" error={!!formErrors.accountNumber} onBlur={validateForm} />
                            {formErrors.accountNumber && <HelperText type="error">{formErrors.accountNumber}</HelperText>}
                            <TextInput label="IFSC Code" value={ifscCode} onChangeText={(text) => setIfscCode(text.toUpperCase())} style={styles.input} autoCapitalize="characters" maxLength={11} mode="outlined" error={!!formErrors.ifscCode} onBlur={validateForm} />
                            {formErrors.ifscCode && <HelperText type="error">{formErrors.ifscCode}</HelperText>}

                            <Divider style={[styles.divider, { marginVertical: 25 }]}/>

                            {isConnecting && connectError !== 'Please complete authorization in the browser window/tab.' && <ActivityIndicator size="small" style={styles.inlineLoading}/>}
                            {Boolean(connectError) && <Text style={styles.errorText}>{connectError}</Text>}
                            <Button mode="contained" onPress={handleConnect} style={styles.button} disabled={isConnecting} loading={isConnecting && connectError !== 'Please complete authorization in the browser window/tab.'} icon="link-variant">
                                Save and Connect Razorpay
                            </Button>
                        </Card.Content>
                    </Card></ScrollView>);
            }
        }
        return <View style={styles.loadingOrErrorContentWrapper}><Text>Could not determine connection status.</Text></View>;
    };

    if (IS_WEB) {
        // Web version does not need KeyboardAvoidingView
        return (
            <View style={styles.webPageContainer_Root}>
                <View style={styles.webMaxContentContainer_Shell}>
                    {isPlatformOwned
                        ? <View style={styles.loadingOrErrorContentWrapper}><Text variant="titleMedium">Payment settings are managed by the platform.</Text></View>
                        : renderContent()
                    }
                </View>
            </View>
        );
    } else {
        // --- MOBILE version wrapped in KeyboardAvoidingView ---
        return (
            <KeyboardAvoidingView
                style={styles.container} // Use the main container style which has flex: 1
                behavior={Platform.OS === "ios" ? "padding" : undefined} // `padding` for iOS, let Android manage itself (which is often best with ScrollView)
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Optional: Adjust for header height on iOS
            >
                {isPlatformOwned
                    ? <View style={styles.loadingOrErrorContentWrapper}><Text variant="titleMedium">Payment settings are managed by the platform.</Text></View>
                    : renderContent()
                }
            </KeyboardAvoidingView>
        );
    }
}

const makeStyles = (theme, isWeb, windowWidth) => {
    return StyleSheet.create({
        container: { padding: 16, flex: 1, backgroundColor: "white", },
        card: { elevation: isWeb ? 2 : 0, width: '100%', marginBottom: 16, backgroundColor: "white", },
        content: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8 },
        title: { marginBottom: 16, textAlign: 'center', fontWeight: 'bold', },
        connectedTitle: { marginBottom: 4, textAlign: 'center', fontWeight: 'bold', color: theme.colors.primary, fontSize: 22 },
        statusComplete: { color: theme.colors.success, fontWeight: 'bold', marginBottom: 10, fontSize: 14 },
        divider: { marginVertical: 15, width: '90%', backgroundColor: theme.colors.outlineVariant, },
        detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, width: '100%', paddingHorizontal: 8, flexWrap: 'wrap', },
        detailLabel: { fontSize: 15, color: theme.colors.onSurfaceVariant, marginRight: 8, fontWeight: 'bold', },
        detailText: { fontSize: 14, color: theme.colors.onSurface, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10, },
        detailTextSmall: { fontSize: 12, color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 16, paddingHorizontal: 10, },
        detailValue: { fontSize: 15, color: theme.colors.onSurface, flexShrink: 1, textAlign: 'left', },
        accountIdText: { fontSize: 15, color: theme.colors.onSurface, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', },
        button: { borderRadius: 8, paddingVertical: 6, width: IS_WEB ? 'auto' : '90%', minWidth: IS_WEB ? 250 : undefined, alignSelf: 'center', },
        disconnectButton: { marginTop: 20, borderColor: theme.colors.error, borderWidth: 1, borderRadius: 8, paddingVertical: 6, width: IS_WEB ? 'auto' : '90%', minWidth: IS_WEB ? 250 : undefined, alignSelf: 'center', },
        disconnectButtonText: { color: theme.colors.error, },
        inlineLoading: { marginVertical: 10, },
        errorText: { color: theme.colors.error, textAlign: 'center', marginVertical: 10, fontSize: 14, },
        errorTextSmall: { color: theme.colors.error, textAlign: 'center', fontSize: 12, marginTop: 4, },
        statusActivated: { color: theme.colors.success, fontWeight: 'bold' },
        statusOther: { color: theme.colors.onSurfaceVariant },
        detailErrorContainer: { marginVertical: 10, padding: 10, backgroundColor: theme.colors.errorContainer, borderRadius: theme.roundness, alignItems: 'center' },
        webPageContainer_Root: { flex: 1, backgroundColor: 'white', alignItems: 'center', paddingVertical: IS_WEB ? 20 : 0, },
        webMaxContentContainer_Shell: { width: '100%', maxWidth: 768, flex: 1, backgroundColor: 'white', padding: 16, borderRadius: IS_WEB ? 8 : 0, },
        loadingOrErrorContentWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', padding: 20, },
        formSectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 12, },
        input: { width: '100%', marginBottom: 8, }
    });
};