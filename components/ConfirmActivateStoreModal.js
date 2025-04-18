import React, { useState } from "react";
import { View, StyleSheet, Alert, TextInput } from "react-native";
import { Text, Button, Modal, Portal, useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../api/client";
import OtpInput from "../components/OtpInput";
import { useQueryClient } from "react-query";
import {setStore} from "../store/storeSlice";

export default function ConfirmActivateStoreModal({ visible, onDismiss, storeId, storeName }) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const store = useSelector((state) => state.store);
    const { phone } = useSelector((state) => state.merchant);

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSendOtp = async () => {
        try {
            await axiosClient.post(`/sendOtp`, {
                phone, context: 'ACTIVATE_STORE', storeId: store.storeId
            });
            setOtpSent(true);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to send OTP.");
        }
    };

    const handleVerifyOTP = async () => {
        try {
            await axiosClient.post(`/verifyOtp`, { phone, otp, context: 'ACTIVATE_STORE' });
            setOtpVerified(true);
        } catch (err) {
            console.error(err);
            setOtpVerified(false);
            Alert.alert("Error", "Failed to verify OTP.");
        }
    };

    const handleActivateStore = async () => {
        try {

            setSubmitting(true);
            await axiosClient.patch(`/stores/${storeId}/activateStore`, { phone, otp });
            dispatch(setStore({ ...store, isActive: true }));
            Alert.alert("Success", "Store has been Activated.");
            queryClient.invalidateQueries(["merchantStores"]);
            onDismiss();
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to activate store.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);
        setConfirmationText("");
        onDismiss();
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={handleCancel} contentContainerStyle={styles.modal}>
                <Text variant="titleMedium" style={{ marginBottom: 16, textAlign: "center" }}>
                    Are you sure you want to activate this store?
                </Text>

                {!otpSent ? (
                    <Button mode="contained" onPress={handleSendOtp}>
                        Yes, Send OTP
                    </Button>
                ) : !otpVerified ? (
                    <>
                        <OtpInput onSubmit={setOtp} />
                        <Button
                            mode="contained"
                            onPress={handleVerifyOTP}
                            disabled={otp.length < 6 || submitting}
                            style={{ marginTop: 16 }}
                        >
                            Verify OTP
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            mode="contained"
                            onPress={handleActivateStore}
                            disabled={submitting}
                        >
                            Confirm Activation
                        </Button>
                    </>
                )}

                <Button
                    mode="outlined"
                    onPress={handleCancel}
                    style={{ marginTop: 16 }}
                >
                    Cancel
                </Button>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 24,
        padding: 16,
        backgroundColor: "white",
        borderRadius: 8,
    },
});