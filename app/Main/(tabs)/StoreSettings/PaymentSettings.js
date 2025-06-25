import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, Platform, ActivityIndicator, ScrollView, KeyboardAvoidingView } from "react-native";
import { useTheme, Button, Text, Card, Title, Divider, TextInput, HelperText, Menu } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import * as WebBrowser from 'expo-web-browser';
import { useMutation } from 'react-query';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { getAxiosClient } from "../../../../api/client";
import { setOAuthState } from "../../../../store/razorpaySlice";
import { NewAddressForm } from "../../../../components/NewAddressForm";
import { business_types } from '../../../../utils/razorpayBusinessData';
import { useGetRazorpayStatus } from "../../../../api/hooks/useGetRazorpayStatus";
import PhoneInput  from "../../../../components/PhoneInput";

const IS_WEB = Platform.OS === 'web';

// --- Helper Functions ---
const formatLabel = (str) => {
    if (!str) return '';
    const spaced = str.replace(/_/g, ' ');
    return spaced.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const businessTypeOptions = business_types.map(type => ({ label: formatLabel(type), value: type }));

// --- Reusable Sub-components ---

const FormSection = ({ title, subtitle, children, titleIcon, noDivider }) => {
    const styles = makeStyles(useTheme(), IS_WEB);
    return (
        <View style={styles.formSectionContainer}>
            {!noDivider && <Divider style={styles.divider}/>}
            <View style={styles.formSectionHeader}>
                <Title style={styles.formSectionTitle}>{title}</Title>
                {titleIcon}
            </View>
            {subtitle && <Text style={styles.formSectionSubtitle}>{subtitle}</Text>}
            {children}
        </View>
    );
};

const FormField = ({ label, value, onChangeText, error, helperText, ...props }) => {
    const styles = makeStyles(useTheme(), IS_WEB);
    return (
        <View style={styles.formFieldContainer}>
            <TextInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                mode="outlined"
                style={styles.input}
                error={!!error}
                {...props}
            />
            {error && <HelperText type="error" visible={true}>{helperText}</HelperText>}
        </View>
    );
};

// --- Main View Components ---

const OnboardingForm = ({ prefillData, onSubmit, isConnecting }) => {
    const theme = useTheme();
    const styles = makeStyles(theme, IS_WEB);
    const merchant = useSelector((state) => state.merchant);

    const [legalBusinessName, setLegalBusinessName] = useState(prefillData?.legalBusinessName || '');
    const [selectedBusinessType, setSelectedBusinessType] = useState(prefillData?.businessType || '');
    const [registeredAddress, setRegisteredAddress] = useState(prefillData?.registeredAddress || {});
    const [addressSaved, setAddressSaved] = useState(Object.keys(prefillData?.registeredAddress || {}).length > 0);
    const [businessTypeMenuVisible, setBusinessTypeMenuVisible] = useState(false);
    const [accountNumber, setAccountNumber] = useState(prefillData?.bankDetails?.account_number || '');
    const [ifscCode, setIfscCode] = useState(prefillData?.bankDetails?.ifsc_code || '');
    const [beneficiaryName, setBeneficiaryName] = useState(prefillData?.bankDetails?.beneficiary_name || '');
    const [stakeholderName, setStakeholderName] = useState(prefillData?.stakeholderDetails?.name || '');
    const [stakeholderEmail, setStakeholderEmail] = useState(prefillData?.stakeholderDetails?.email || '');
    const [stakeholderPan, setStakeholderPan] = useState(prefillData?.stakeholderDetails?.pan || '');
    const [merchantEmail, setMerchantEmail] = useState(merchant.email || '');
    const [merchantPhone, setMerchantPhone] = useState(merchant.phone || '');
    const [formErrors, setFormErrors] = useState({});

    const handleAddressSave = (addressData) => {
        setRegisteredAddress(addressData);
        setAddressSaved(true);
        setFormErrors(p => ({ ...p, registeredAddress: null }));
    };

    const handleAddressDiscard = () => {
        setRegisteredAddress({});
        setAddressSaved(false);
    };

    const validateForm = () => {
        const errors = {};
        if (!legalBusinessName.trim()) errors.legalBusinessName = "Legal business name is required.";
        if (!selectedBusinessType) errors.businessType = "Business type is required.";
        if (!addressSaved || !registeredAddress.street1) errors.registeredAddress = "A complete registered address is required.";
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
        if (!merchant.phone && !merchantPhone.trim()) {
            errors.merchantPhone = "A phone number is required for payouts.";
        }
        if (!merchant.email && !merchantEmail.trim()) {
            errors.merchantEmail = "An email is required for payouts.";
        } else if (!merchant.email && !/\S+@\S+\.\S+/.test(merchantEmail)) {
            errors.merchantEmail = "Please enter a valid email address.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return Alert.alert("Incomplete Form", "Please fix the errors and fill in all required fields.");
        }
        onSubmit({
            legalBusinessName,
            businessType: selectedBusinessType,
            registeredAddress,
            accountNumber,
            ifscCode,
            beneficiaryName,
            stakeholderName,
            stakeholderEmail,
            stakeholderPan,
            email: merchant.email ? undefined : merchantEmail,
            phone: merchant.phone ? undefined : merchantPhone,
        });
    };

    const renderDropdownAnchor = (label, selectedValue, onPress, error) => (
        <View style={styles.formFieldContainer}>
            <Button
                mode="outlined"
                onPress={onPress}
                style={[styles.dropdownAnchor, error && { borderColor: theme.colors.error }]}
                labelStyle={styles.dropdownLabel}
                contentStyle={{ justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                icon="menu-down"
            >
                {selectedValue ? formatLabel(selectedValue) : `Select ${label}`}
            </Button>
            {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}
        </View>
    );

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <Title style={styles.mainTitle}>Connect Your Payout Account</Title>
                <Text style={styles.subtitle}>
                    Provide your business and payout details once. This will be used for all your stores.
                </Text>

                <FormSection title="Legal Details" noDivider>
                    <FormField
                        label="Legal Business Name"
                        value={legalBusinessName}
                        onChangeText={setLegalBusinessName}
                        error={!!formErrors.legalBusinessName}
                        helperText={formErrors.legalBusinessName}
                    />
                    <Menu
                        visible={businessTypeMenuVisible}
                        onDismiss={() => setBusinessTypeMenuVisible(false)}
                        anchor={renderDropdownAnchor("Business Type", selectedBusinessType, () => setBusinessTypeMenuVisible(true), formErrors.businessType)}
                    >
                        {businessTypeOptions.map(opt => (
                            <Menu.Item key={opt.value} title={opt.label} onPress={() => { setSelectedBusinessType(opt.value); setBusinessTypeMenuVisible(false); }} />
                        ))}
                    </Menu>
                </FormSection>

                {(!merchant.phone || !merchant.email) && (
                    <FormSection title="Primary Contact Details" subtitle="Razorpay requires both a phone number and an email to set up payments.">
                        {!merchant.email && (
                            <FormField
                                label="Your Contact Email"
                                value={merchantEmail}
                                onChangeText={setMerchantEmail}
                                keyboardType="email-address"
                                error={!!formErrors.merchantEmail}
                                helperText={formErrors.merchantEmail}
                            />
                        )}
                        {!merchant.phone && (
                            <PhoneInput
                                label={"Your Contact Phone Number"}
                                setPhone={setMerchantPhone}
                                error={!!formErrors.merchantPhone}
                            />
                        )}
                    </FormSection>
                )}

                <FormSection
                    title="Registered Business Address"
                    titleIcon={addressSaved && <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} style={{ marginLeft: 8 }} />}
                >
                    {formErrors.registeredAddress && <HelperText type="error" visible={true}>{formErrors.registeredAddress}</HelperText>}
                    <NewAddressForm
                        initialValues={registeredAddress}
                        onSaveHandler={handleAddressSave}
                        onDiscardHandler={handleAddressDiscard}
                        buttonLabel="Save Address"
                    />
                </FormSection>

                <FormSection title="Stakeholder & Bank Details" subtitle="Enter details for the primary business owner. Name and PAN must match official records.">
                    <FormField label="Full Name (as on PAN card)" value={stakeholderName} onChangeText={setStakeholderName} error={!!formErrors.stakeholderName} helperText={formErrors.stakeholderName}/>
                    <FormField label="Stakeholder Email" value={stakeholderEmail} onChangeText={setStakeholderEmail} keyboardType="email-address" autoCapitalize="none" error={!!formErrors.stakeholderEmail} helperText={formErrors.stakeholderEmail} />
                    <FormField label="PAN (Permanent Account Number)" value={stakeholderPan} onChangeText={(text) => setStakeholderPan(text.toUpperCase())} autoCapitalize="characters" maxLength={10} error={!!formErrors.stakeholderPan} helperText={formErrors.stakeholderPan}/>
                    <FormField label="Beneficiary Name (as per bank records)" value={beneficiaryName} onChangeText={setBeneficiaryName} error={!!formErrors.beneficiaryName} helperText={formErrors.beneficiaryName}/>
                    <FormField label="Bank Account Number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" error={!!formErrors.accountNumber} helperText={formErrors.accountNumber}/>
                    <FormField label="IFSC Code" value={ifscCode} onChangeText={(text) => setIfscCode(text.toUpperCase())} autoCapitalize="characters" maxLength={11} error={!!formErrors.ifscCode} helperText={formErrors.ifscCode}/>
                </FormSection>

                <Button mode="contained" onPress={handleSubmit} style={styles.primaryButton} disabled={isConnecting} loading={isConnecting} icon="link-variant">
                    Save and Connect with Razorpay
                </Button>
            </Card.Content>
        </Card>
    );
};

const LinkStoreView = ({ onLink, isLinking }) => {
    const styles = makeStyles(useTheme(), IS_WEB);
    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <MaterialCommunityIcons name="check-decagram" size={48} color={styles.statusActivated.color} />
                <Title style={[styles.mainTitle, { marginTop: 16 }]}>Payment Profile Ready</Title>
                <Text style={styles.subtitle}>
                    Your business and financial details are already set up. Link this store to start receiving payments.
                </Text>
                <Button mode="contained" onPress={onLink} style={styles.primaryButton} disabled={isLinking} loading={isLinking} icon="link-variant-plus">
                    Link This Store
                </Button>
            </Card.Content>
        </Card>
    );
};

const ConnectionDetailsView = ({ statusData, onDisconnect, onRetry, isConnecting, isLoadingStatus, refetchStatus }) => {
    const theme = useTheme();
    const styles = makeStyles(theme, IS_WEB);
    const { setupStatus, linkedAccountId, liveDetails } = statusData;

    const renderStatusMessage = () => {
        if (setupStatus === 'complete') return null;

        let title = "Setup Incomplete";
        let message = "Your Razorpay account is linked, but setup is not yet complete. Please contact support if the issue persists.";
        let canRetry = false;

        switch (setupStatus) {
            case 'route_account_failed': message = "We couldn't create a Route-enabled account with Razorpay. Please try connecting again."; canRetry = true; break;
            case 'stakeholder_creation_failed': message = "We linked your account, but couldn't verify stakeholder details. Please check your information and try again."; canRetry = true; break;
            case 'product_request_failed': case 'product_update_failed': message = "We linked your account, but couldn't activate payouts with your bank details. Please try again."; canRetry = true; break;
            default: title = "Setup is Processing"; message = "Your Razorpay account is linked and setup is being finalized. This can take a few moments. Please refresh in a bit."; break;
        }

        return (
            <View style={styles.centeredContent}>
                <MaterialCommunityIcons name="progress-alert" size={48} color={theme.colors.warning || '#FFA500'} />
                <Title style={[styles.mainTitle, { marginTop: 16 }]}>{title}</Title>
                <Text style={styles.subtitle}>{message}</Text>
                {canRetry && (<Button onPress={onRetry} icon="refresh" style={{ marginTop: 20 }} disabled={isConnecting}>Retry Setup</Button>)}
                <Button onPress={() => refetchStatus()} style={{ marginTop: 10 }} disabled={isConnecting || isLoadingStatus} loading={isLoadingStatus}>Refresh Status</Button>
                <Divider style={styles.divider} />
            </View>
        );
    }

    const renderConnectionDetails = () => {
        if (setupStatus !== 'complete') return null;
        return (
            <View style={{width: '100%'}}>
                <Title style={styles.connectedTitle}>Razorpay Account Linked</Title>
                <Text style={styles.statusComplete}>(Setup Complete & Active)</Text>
                <Divider style={styles.divider}/>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Route Account ID:</Text><Text style={styles.accountIdText} selectable>{linkedAccountId || 'N/A'}</Text></View>
                {liveDetails?.error ? (
                    <View style={styles.detailErrorContainer}>
                        <Text style={styles.errorText}>Could not fetch live details:</Text>
                        <Text style={styles.errorTextSmall}>{liveDetails.error}</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.detailRow}><Text style={styles.detailLabel}>Account Name:</Text><Text style={styles.detailValue} numberOfLines={1}>{liveDetails.name || 'N/A'}</Text></View>
                        <View style={styles.detailRow}><Text style={styles.detailLabel}>Email:</Text><Text style={styles.detailValue} numberOfLines={1}>{liveDetails.email || 'N/A'}</Text></View>
                        <View style={styles.detailRow}><Text style={styles.detailLabel}>Razorpay Status:</Text><Text style={[styles.detailValue, liveDetails.status === 'activated' ? styles.statusActivated : styles.statusOther]}>{liveDetails.status ? formatLabel(liveDetails.status) : 'N/A'}</Text></View>
                    </>
                )}
            </View>
        )
    };

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                {renderStatusMessage()}
                {renderConnectionDetails()}
                <Button mode="outlined" onPress={onDisconnect} style={styles.disconnectButton} labelStyle={styles.disconnectButtonText} icon="link-off" disabled={isConnecting} loading={isConnecting}>
                    {setupStatus === 'complete' ? 'Disconnect Account' : 'Disconnect and Start Over'}
                </Button>
            </Card.Content>
        </Card>
    );
};

// --- Main Screen Component ---

export default function PaymentSettingsScreen() {
    const axiosClient = getAxiosClient();
    const dispatch = useDispatch();
    const theme = useTheme();
    const styles = makeStyles(theme, IS_WEB);

    const { storeId, isPlatformOwned } = useSelector((state) => state.store);
    const { oauthState: originalStateForVerification } = useSelector((state) => state.razorpay);

    const { data: paymentStatus, isLoading: isLoadingStatus, isError, error: statusError, refetch: refetchStatus } = useGetRazorpayStatus(storeId);

    const useMutateWithAlerts = (mutationFn, { successMsg, errorMsg, onMutateSuccess }) => {
        return useMutation(mutationFn, {
            onSuccess: (data) => {
                Alert.alert("Success", successMsg);
                if (onMutateSuccess) onMutateSuccess(data);
                refetchStatus();
            },
            onError: (err) => Alert.alert("Error", `${errorMsg}: ${err.response?.data?.error || err.message}`),
        });
    };

    const { mutate: initiateOAuth, isLoading: isInitiatingOAuth } = useMutation(
        async (formData) => {
            const platform = IS_WEB ? 'web' : 'mobile';
            let env = 'production';
            if (__DEV__) {
                env = 'local';
            } else {
                const buildEnv = process.env.EXPO_PUBLIC_APP_ENV || 'development';
                if (buildEnv === 'development') {
                    env = 'qa';
                }
            }
            const queryParams = new URLSearchParams({ storeId, platform, env }).toString();
            const { data } = await axiosClient.post(`/razorpay/initiateOAuth?${queryParams}`, formData);
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

    const { mutate: linkStore, isLoading: isLinking } = useMutateWithAlerts(
        () => axiosClient.post(`/stores/${storeId}/linkPaymentAccount`),
        { successMsg: "Store linked successfully!", errorMsg: "Failed to link store" }
    );

    const { mutate: disconnectStore, isLoading: isDisconnecting } = useMutateWithAlerts(
        () => axiosClient.post(`/razorpay/disconnect`, { storeId }),
        { successMsg: "Razorpay account disconnected.", errorMsg: "Failed to disconnect" }
    );

    const handleOAuthMessageFromPopup = useCallback(async (event) => {
        if (event.origin !== window.location.origin || !event.data || event.data.type !== 'RAZORPAY_OAUTH_POPUP_DATA') return;

        if (event.data.error) {
            Alert.alert("Connection Failed", event.data.error_description || event.data.error);
            dispatch(setOAuthState(null));
            return;
        }

        if (!originalStateForVerification || event.data.receivedStateFromPopup !== originalStateForVerification) {
            Alert.alert("Security Error", "State mismatch detected. Please try again.");
            dispatch(setOAuthState(null));
            return;
        }
        dispatch(setOAuthState(null));

        try {
            await axiosClient.post(`/razorpay/exchangeCodeForTokens`, { code: event.data.code, state: event.data.receivedStateFromPopup, storeId });
            Alert.alert("Success", "Account connected! Finalizing setup in the background.");
            refetchStatus();
        } catch (exchangeError) {
            Alert.alert("Connection Error", `Failed to finalize connection: ${exchangeError.message}`);
        }
    }, [axiosClient, dispatch, originalStateForVerification, storeId, refetchStatus]);

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

        switch (paymentStatus.status) {
            case 'NOT_ONBOARDED':
                return <OnboardingForm prefillData={paymentStatus.prefillData} onSubmit={initiateOAuth} isConnecting={isInitiatingOAuth} />;
            case 'ONBOARDED_NOT_LINKED':
                return <LinkStoreView onLink={linkStore} isLinking={isLinking} />;
            case 'LINKED':
                const isConnecting = isDisconnecting || isInitiatingOAuth;
                return <ConnectionDetailsView statusData={paymentStatus} onDisconnect={disconnectStore} onRetry={() => initiateOAuth(paymentStatus.prefillData)} isConnecting={isConnecting} isLoadingStatus={isLoadingStatus} refetchStatus={refetchStatus} />;
            default:
                return <View style={styles.centeredContent}><Text>Unknown payment status.</Text></View>;
        }
    };

    if (isPlatformOwned) {
        return (
            <View style={styles.container}>
                <View style={styles.centeredContent}>
                    <Text>Payment settings are managed by the platform.</Text>
                </View>
            </View>
        );
    }

    const Wrapper = IS_WEB ? View : KeyboardAvoidingView;
    const wrapperProps = IS_WEB
        ? { style: styles.webRootContainer }
        : { style: { flex: 1 }, behavior: Platform.OS === "ios" ? "padding" : "height" };

    return (
        <Wrapper {...wrapperProps}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContentContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.contentWrapper}>
                    {renderContent()}
                </View>
            </ScrollView>
        </Wrapper>
    );
}

// --- Centralized Stylesheet ---

const makeStyles = (theme, isWeb) => StyleSheet.create({
    // --- LAYOUT CONTAINERS ---
    webRootContainer: {
        flex: 1,
        backgroundColor: '#f4f5f7',
        alignItems: 'center',
        justifyContent: 'center',
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
        maxWidth: 768,
        alignSelf: 'center',
        padding: isWeb ? 24 : 16,
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
        padding: isWeb ? 24 : 16,
        alignItems: 'center',
    },

    // --- TYPOGRAPHY & TEXT ---
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
        maxWidth: 500,
    },
    connectedTitle: {
        marginBottom: 4,
        textAlign: 'center',
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontSize: 22,
    },

    // --- FORM STYLES ---
    formFieldContainer: {
        width: '100%',
        marginBottom: 12,
    },
    formSectionContainer: {
        width: '100%',
        marginBottom: 8,
    },
    formSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    formSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    formSectionSubtitle: {
        fontSize: 13,
        color: theme.colors.onSurfaceVariant,
        marginBottom: 16,
        alignSelf: 'flex-start',
        lineHeight: 18,
    },
    input: {
        width: '100%',
    },
    dropdownAnchor: {
        backgroundColor: 'white',
        height: 56,
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: theme.colors.outline,
    },
    dropdownLabel: {
        textAlign: 'left',
        color: theme.colors.onSurface,
    },

    // --- BUTTONS ---
    primaryButton: {
        borderRadius: 8,
        paddingVertical: 6,
        marginTop: 24,
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
    statusComplete: {
        color: theme.colors.success,
        fontWeight: 'bold',
        marginBottom: 16,
        fontSize: 14,
        textAlign: 'center',
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
    statusOther: {
        color: theme.colors.warning || 'orange',
    },

    // --- ERROR STYLES ---
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
        fontWeight: 'bold'
    },
    errorTextSmall: {
        color: theme.colors.error,
        textAlign: 'center',
        fontSize: 12,
        marginTop: 4,
    },
    detailErrorContainer: {
        marginVertical: 10,
        padding: 12,
        backgroundColor: theme.colors.errorContainer,
        borderRadius: theme.roundness,
        alignItems: 'center',
        width: '100%',
    },
});
