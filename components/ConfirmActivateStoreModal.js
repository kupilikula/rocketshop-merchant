// ConfirmActivateStoreModal.js

import React, { useState, useEffect } from "react";
import {View, StyleSheet, Alert, ActivityIndicator, Platform} from "react-native";
import { Text, Button, Modal, Portal, useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "react-query";

import { getAxiosClient } from "../api/client";
import OtpInput from "../components/OtpInput";
import { setStore } from "../store/storeSlice";
import * as Linking from 'expo-linking';
import {useStoreActivationReadiness} from "../api/hooks/useStoreActivationReadiness";
import {useRouter} from "expo-router"; // --- NEW: Import Linking API ---

// Helper functions to mask identifiers for display
const maskPhone = (phone) => {
    if (!phone || phone.length < 10) return "Invalid Phone";
    return `${phone.substring(0, 3)}...${phone.substring(phone.length - 4)}`;
};

const maskEmail = (email) => {
    if (!email || !email.includes('@')) return "Invalid Email";
    const [user, domain] = email.split('@');
    return `${user.substring(0, 2)}... @${domain}`;
};

const IS_WEB = Platform.OS === 'web';

export default function ConfirmActivateStoreModal({ visible, onDismiss, storeId, storeName, modalStyle }) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
    const router = useRouter();

    const { phone, email } = useSelector((state) => state.merchant);
    const store = useSelector((state) => state.store);

    const [step, setStep] = useState('CHECKING_READINESS'); // 'CHOICE', 'OTP_SENT', 'OTP_VERIFIED'
    const [authMethod, setAuthMethod] = useState('phone');
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [readinessResponse, setReadinessResponse] = useState(null);

    const { refetch: checkReadiness, isFetching: isCheckingReadiness } = useStoreActivationReadiness(storeId, {
        onSuccess: (data) => {
            if (data.isReady) {
                setStep('CHOICE');
            } else {
                // Store the entire detailed response object from the API
                setReadinessResponse(data);
                setStep('READINESS_FAILED');
            }
        },
        onError: (err) => {
            // Handle generic network/server errors for the check
            setReadinessResponse({ message: err.response?.data?.message || 'Could not check store readiness.' });
            setStep('READINESS_FAILED');
        }
    });

    // Reset state when modal is dismissed or reopened
    useEffect(() => {
        if (visible) {
            setAuthMethod(phone ? 'phone' : 'email');
            checkReadiness();
        } else {
            setTimeout(() => { // Reset state on close
                setStep('CHECKING_READINESS');
                setOtp("");
                setReadinessResponse(null);
                setIsLoading(false);
            }, 300);
        }
    }, [visible, phone, email, checkReadiness]);

    // New handler to toggle between phone and email
    const handleToggleAuthMethod = () => {
        setAuthMethod(prevMethod => (prevMethod === 'phone' ? 'email' : 'phone'));
        setError(''); // Clear any previous errors
    };

    const handleSendOtp = async () => {
        setIsLoading(true);
        setError('');
        const identifier = authMethod === 'phone' ? phone : email;

        if (!identifier) {
            setError(`No ${authMethod} is registered for this account.`);
            setIsLoading(false);
            return;
        }

        try {
            await axiosClient.post(`/auth/send-otp`, {
                identifier,
                type: authMethod,
                context: 'ACTIVATE_STORE',
                storeId: store.storeId,
                app: 'merchant'
            });
            setStep('OTP_SENT');
        } catch (err) {
            console.error(err);
            setError("Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (submittedOtp) => {
        setIsLoading(true);
        setError('');
        const identifier = authMethod === 'phone' ? phone : email;

        try {
            await axiosClient.post(`/auth/verify-otp`, {
                identifier,
                type: authMethod,
                otp: submittedOtp,
                context: 'ACTIVATE_STORE',
                app: 'merchant'
            });
            setOtp(submittedOtp);
            setStep('OTP_VERIFIED');
        } catch (err) {
            console.error(err);
            setError(err.response?.status === 429 ? "Too many attempts. Please request a new OTP." : "Invalid OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleActivateStore = async () => {
        setIsLoading(true);
        setError('');
        try {
            await axiosClient.patch(`/stores/${storeId}/activate`, {
                identifier: authMethod === 'phone' ? phone : email,
                type: authMethod,
                otp
            });
            dispatch(setStore({ ...store, isActive: true }));
            Alert.alert("Success", "Store has been Activated.");
            queryClient.invalidateQueries(["merchantStores"]);
            queryClient.invalidateQueries(["subscriptionStatus", storeId]);
            onDismiss();
        } catch (err) {
            // The 402 error should no longer happen here, but we can keep the generic catch
            console.error("Activation Error:", err);
            setError(err.response?.data?.message || "Failed to activate store. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRedirectToWeb = async () => {

        let token = null;
        if (!IS_WEB) {
            const {data} = await axiosClient.post('/auth/auto-login/generate');
            token = data.token;
        }
        let billingUrl;

        if (IS_WEB) {
            router.replace('/(web_merchant)/billing')
        } else {
            const subdomain = process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'subscription' : 'subscription.qa';
            billingUrl = `https://${subdomain}.rocketshop.in/billing?storeId=${storeId}&token=${token}`;
        }
        Linking.openURL(billingUrl);
        onDismiss();
    };

    const renderStepContent = () => {
        const identifierDisplay = authMethod === 'phone' ? maskPhone(phone) : maskEmail(email);
        const toggleButtonText = authMethod === 'phone' ? 'Use Email Instead' : 'Use Phone Instead';

        switch (step) {
            case 'CHECKING_READINESS':
                return (
                    <>
                        <Text style={styles.title}>Checking Readiness...</Text>
                        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
                        <Text style={styles.subtitle}>Verifying your store setup and subscription...</Text>
                    </>
                );

            case 'READINESS_FAILED':
                // Check the detailed response to decide what to show
                const hasSub = readinessResponse?.checks?.hasActiveSubscription;
                const hasProducts = readinessResponse?.checks?.hasActiveProducts;

                // Scenario 1: No active products is the issue
                if (!hasProducts && hasSub) {
                    return (
                        <>
                            <Text style={styles.title}>No Active Products</Text>
                            <Text style={styles.subtitle}>{readinessResponse.message}</Text>
                        </>
                    );
                }

                // Scenario 2: No subscription is the issue
                if (!hasSub && hasProducts) {
                    return (
                        <>
                            <Text style={styles.title}>Active Subscription Required</Text>
                            <Text style={styles.subtitle}>{readinessResponse.message}</Text>
                            <Button mode="contained" onPress={handleRedirectToWeb} style={styles.button}>
                                Go to Billing
                            </Button>
                        </>
                    );
                }

                if (!hasSub && !hasProducts) {
                    return (
                        <>
                            <Text style={styles.title}>Active Subscription and Active Product(s) Required</Text>
                            <Button mode="contained" onPress={handleRedirectToWeb} style={styles.button}>
                                Go to Billing
                            </Button>

                        </>
                    );
                }

                // Generic fallback
                return <Text style={styles.errorText}>{readinessResponse.message}</Text>;

            case 'CHOICE':
                return (
                    <>
                        <Text variant="titleMedium" style={styles.title}>
                            {`Activate ${storeName}?`}
                        </Text>
                        <Text style={styles.subtitle}>
                            {`An OTP will be sent to your registered ${authMethod}`}:
                        </Text>
                        <Text style={styles.identifierText}>{identifierDisplay}</Text>
                        <Button mode="contained" onPress={handleSendOtp} loading={isLoading} disabled={isLoading} style={styles.button}>
                            Send OTP
                        </Button>
                        {/* Only show the toggle button if BOTH phone and email exist */}
                        {Boolean(phone) && Boolean(email) && (
                            <Button
                                mode="text"
                                onPress={handleToggleAuthMethod}
                                textColor={theme.colors.primary}
                                disabled={isLoading}
                                style={{ marginTop: 8 }}
                            >
                                {toggleButtonText}
                            </Button>
                        )}
                    </>
                );

            case 'OTP_SENT':
                return (
                    <>
                        <Text style={styles.subtitle}>{`Enter the OTP sent to ${identifierDisplay}`}</Text>
                        <OtpInput
                            otpLength={6}
                            onSubmit={handleVerifyOTP}
                            key={error ? `otp-error-${Date.now()}` : 'otp-normal'}
                        />
                        <Button
                            mode="text"
                            onPress={() => setStep('CHOICE')}
                            textColor={theme.colors.primary}
                            disabled={isLoading}
                        >
                            Change Method
                        </Button>
                    </>
                );

            case 'OTP_VERIFIED':
                return (
                    <>
                        <Text style={styles.subtitle}>OTP Verified. Ready to activate.</Text>
                        <Button
                            mode="contained"
                            onPress={handleActivateStore}
                            loading={isLoading}
                            disabled={isLoading}
                            style={styles.button}
                        >
                            Confirm Activation
                        </Button>
                    </>
                );

            case 'PAYMENT_REQUIRED':
                return (
                    <>
                        <Text variant="titleMedium" style={styles.title}>
                            Subscription Required
                        </Text>
                        <Text style={styles.subtitle}>
                            {error}
                        </Text>
                        <Button
                            mode="contained"
                            onPress={handleRedirectToWeb}
                            style={styles.button}
                        >
                            Go to Billing Page
                        </Button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modal, modalStyle]}>
                {renderStepContent()}
                {Boolean(error) && step !== 'READINESS_FAILED' && <Text style={styles.errorText}>{error}</Text>}
                <Button
                    mode="outlined"
                    onPress={onDismiss}
                    style={styles.button}
                    disabled={isLoading}
                >
                    {step === 'READINESS_FAILED' ? 'Close' : 'Cancel'}
                </Button>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 24,
        padding: 24,
        backgroundColor: "white",
        borderRadius: 12,
    },
    title: {
        marginBottom: 8,
        textAlign: "center",
        fontWeight: "bold",
    },
    subtitle: {
        marginBottom: 8,
        textAlign: 'center',
        color: '#666'
    },
    identifierText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#000',
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        marginTop: 16,
    },
    errorText: {
        marginTop: 16,
        color: 'red',
        textAlign: 'center',
    },
});