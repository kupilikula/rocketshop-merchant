// ConfirmDeleteStoreModal.js

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, TextInput } from "react-native";
import { Text, Button, Modal, Portal, useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { useRouter } from "expo-router";

import { getAxiosClient } from "../api/client";
import OtpInput from "../components/OtpInput";
import { clearStore } from "../store/storeSlice";

// Helper functions to mask identifiers for display
const maskPhone = (phone) => {
    if (!phone || phone.length < 10) return "Invalid Phone";
    return `${phone.substring(0, 5)}...${phone.substring(phone.length - 4)}`;
};

const maskEmail = (email) => {
    if (!email || !email.includes('@')) return "Invalid Email";
    const [user, domain] = email.split('@');
    return `${user.substring(0, 2)}... @${domain}`;
};


export default function ConfirmDeleteStoreModal({ visible, onDismiss, storeId, storeName, modalStyle }) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
    const router = useRouter();

    const { phone, email } = useSelector((state) => state.merchant);
    const store = useSelector((state) => state.store);

    const [step, setStep] = useState('CHOICE'); // 'CHOICE', 'OTP_SENT', 'OTP_VERIFIED'
    const [authMethod, setAuthMethod] = useState('phone');
    const [otp, setOtp] = useState("");
    const [confirmationText, setConfirmationText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const confirmationPhrase = `Delete ${storeName}`;

    // Reset state when modal is dismissed or reopened
    useEffect(() => {
        if (visible) {
            setAuthMethod(phone ? 'phone' : 'email');
        } else {
            setTimeout(() => {
                setStep('CHOICE');
                setOtp("");
                setConfirmationText("");
                setError('');
                setIsLoading(false);
            }, 300);
        }
    }, [visible, phone, email]);

    const handleToggleAuthMethod = () => {
        setAuthMethod(prevMethod => (prevMethod === 'phone' ? 'email' : 'phone'));
        setError('');
    };

    const handleSendOtp = async () => {
        setIsLoading(true);
        setError('');
        const identifier = authMethod === 'phone' ? phone : email;

        try {
            await axiosClient.post(`/auth/send-otp`, {
                identifier,
                type: authMethod,
                context: 'DELETE_STORE',
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
                context: 'DELETE_STORE',
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

    const handleDeleteStore = async () => {
        if (confirmationText !== confirmationPhrase) {
            setError(`Please type '${confirmationPhrase}' to confirm.`);
            return;
        }
        setIsLoading(true);
        setError('');
        const identifier = authMethod === 'phone' ? phone : email;

        try {
            await axiosClient.delete(`/stores/${storeId}`, {
                identifier,
                type: authMethod,
                otp
            });
            dispatch(clearStore());
            Alert.alert("Success", "Store has been deleted.");
            router.replace('/StoreSelector?exitToLogout=true');
            queryClient.invalidateQueries(["merchantStores"]);
            onDismiss();
        } catch (err) {
            console.error(err);
            setError("Failed to delete store. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        const identifierDisplay = authMethod === 'phone' ? maskPhone(phone) : maskEmail(email);
        const toggleButtonText = authMethod === 'phone' ? 'Use Email Instead' : 'Use Phone Instead';

        switch (step) {
            case 'CHOICE':
                return (
                    <>
                        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.error }]}>
                            Delete "{storeName}"?
                        </Text>
                        <Text style={styles.subtitle}>
                            This action is permanent. An OTP will be sent to your registered {authMethod}:
                        </Text>
                        <Text style={styles.identifierText}>{identifierDisplay}</Text>
                        <Button
                            mode="contained"
                            onPress={handleSendOtp}
                            loading={isLoading}
                            disabled={isLoading}
                            style={styles.button}
                            buttonColor={theme.colors.error}
                        >
                            Send OTP to Delete
                        </Button>
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
                        <Text style={styles.subtitle}>
                            Type: <Text style={{ fontWeight: "bold" }}>{confirmationPhrase}</Text> to confirm.
                        </Text>
                        <TextInput
                            placeholder={confirmationPhrase}
                            onChangeText={setConfirmationText}
                            style={styles.textInput}
                        />
                        <Button
                            mode="contained"
                            onPress={handleDeleteStore}
                            loading={isLoading}
                            disabled={isLoading}
                            style={styles.button}
                            buttonColor={theme.colors.error}
                        >
                            Confirm Store Deletion
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
                <View style={{ alignItems: 'center' }}>
                    {renderStepContent()}
                    {error && <Text style={styles.errorText}>{error}</Text>}
                    <Button
                        mode="outlined"
                        onPress={onDismiss}
                        style={styles.button}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </View>
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
    textInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        width: '100%',
        marginTop: 8,
        fontSize: 16,
    },
    button: {
        marginTop: 16,
        width: '80%',
    },
    errorText: {
        marginTop: 16,
        color: 'red',
        textAlign: 'center',
    },
});