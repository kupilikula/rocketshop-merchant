// ConfirmActivateStoreModal.js

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Modal, Portal, useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "react-query";

import { getAxiosClient } from "../api/client";
import OtpInput from "../components/OtpInput";
import { setStore } from "../store/storeSlice";
import * as Linking from 'expo-linking'; // --- NEW: Import Linking API ---

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


export default function ConfirmActivateStoreModal({ visible, onDismiss, storeId, storeName, modalStyle }) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();

    const { phone, email } = useSelector((state) => state.merchant);
    const store = useSelector((state) => state.store);

    const [step, setStep] = useState('CHOICE'); // 'CHOICE', 'OTP_SENT', 'OTP_VERIFIED'
    const [authMethod, setAuthMethod] = useState('phone');
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [manageUrl, setManageUrl] = useState(null); // --- NEW: State to hold the redirect URL ---

    // Reset state when modal is dismissed or reopened
    useEffect(() => {
        if (visible) {
            // Default to phone if available, otherwise email. This handles merchants with only one contact method.
            setAuthMethod(phone ? 'phone' : 'email');
        } else {
            // Reset state completely on close
            setTimeout(() => {
                setStep('CHOICE');
                setOtp("");
                setError('');
                setManageUrl(null);
                setIsLoading(false);
            }, 300);
        }
    }, [visible, phone, email]);

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
            await axiosClient.post(`/sendOtp`, {
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
            await axiosClient.post(`/verifyOtp`, {
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
        const identifier = authMethod === 'phone' ? phone : email;

        try {
            await axiosClient.patch(`/stores/${storeId}/activateStore`, {
                identifier,
                type: authMethod,
                otp
            });
            dispatch(setStore({ ...store, isActive: true }));
            Alert.alert("Success", "Store has been Activated.");
            queryClient.invalidateQueries(["merchantStores"]);
            queryClient.invalidateQueries(["subscriptionStatus", storeId]); // Invalidate status too
            onDismiss();
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 402) {
                // Set the state to show the new UI
                setError(err.response.data.message || "An active subscription is required.");
                setManageUrl(err.response.data.manageSubscriptionUrl);
                setStep('PAYMENT_REQUIRED');
            } else {
                // For all other errors, show a generic message
                setError("Failed to activate store. Please try again.");
            }
            setError("Failed to activate store. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRedirectToWeb = () => {
        if (manageUrl) {
            Linking.openURL(manageUrl);
            onDismiss(); // Close the modal after redirecting
        }
    };

    const renderStepContent = () => {
        const identifierDisplay = authMethod === 'phone' ? maskPhone(phone) : maskEmail(email);
        const toggleButtonText = authMethod === 'phone' ? 'Use Email Instead' : 'Use Phone Instead';

        switch (step) {
            case 'CHOICE':
                return (
                    <>
                        <Text variant="titleMedium" style={styles.title}>
                            Activate "{storeName}"?
                        </Text>
                        <Text style={styles.subtitle}>
                            An OTP will be sent to your registered {authMethod}:
                        </Text>
                        <Text style={styles.identifierText}>{identifierDisplay}</Text>
                        <Button mode="contained" onPress={handleSendOtp} loading={isLoading} disabled={isLoading} style={styles.button}>
                            Send OTP
                        </Button>
                        {/* Only show the toggle button if BOTH phone and email exist */}
                        {phone && email && (
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
                        <Text style={styles.subtitle}>Enter the OTP sent to {identifierDisplay}</Text>
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
                {error && step !== 'PAYMENT_REQUIRED' && <Text style={styles.errorText}>{error}</Text>}
                <Button
                    mode="outlined"
                    onPress={onDismiss}
                    style={styles.button}
                    disabled={isLoading}
                >
                    {step === 'PAYMENT_REQUIRED' ? 'Close' : 'Cancel'}
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