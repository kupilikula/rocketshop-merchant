import React, { useState } from "react";
import { View, StyleSheet, Alert, TextInput } from "react-native";
import { Text, Button, Modal, Portal, useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { getAxiosClient } from "../api/client";
import OtpInput from "../components/OtpInput";
import { useQueryClient } from "react-query";
import {setStore} from "../store/storeSlice";

export default function ConfirmDeactivateStoreModal({ visible, onDismiss, storeId, storeName }) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const store = useSelector((state) => state.store);
    const { phone } = useSelector((state) => state.merchant);

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSendOtp = async () => {
        try {
            await axiosClient.post(`/sendOtp`, {
                phone, context: 'DEACTIVATE_STORE', storeId: store.storeId
            });
            setOtpSent(true);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to send OTP.");
        }
    };

    const handleVerifyOTP = async () => {
        try {
            await axiosClient.post(`/verifyOtp`, { phone, otp, context: 'DEACTIVATE_STORE' });
            setOtpVerified(true);
        } catch (err) {
            console.error(err);
            setOtpVerified(false);
            Alert.alert("Error", "Failed to verify OTP.");
        }
    };

    const handleDeactivateStore = async () => {
        try {
            if (confirmationText !== `Deactivate ${storeName}`) {
                Alert.alert("Error", `Please type 'Deactivate ${storeName}' to confirm.`);
                return;
            }

            setSubmitting(true);
            await axiosClient.patch(`/stores/${storeId}/deactivateStore`, { phone, otp });
            dispatch(setStore({ ...store, isActive: false }));
            Alert.alert("Success", "Store has been deactivated.");
            queryClient.invalidateQueries(["merchantStores"]);
            onDismiss();
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to deactivate store.");
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
                    Are you sure you want to deactivate this store?
                </Text>

                {!otpSent ? (
                    <View style={{flexDirection: "row", justifyContent: "center"}}>
                    <Button mode="contained" onPress={handleSendOtp}>
                        Yes, Send OTP
                    </Button>
                    </View>
                ) : !otpVerified ? (
                    <>
                        <OtpInput onSubmit={setOtp} />
                        <View style={{flexDirection: "row", justifyContent: "center"}}>
                        <Button
                            mode="contained"
                            onPress={handleVerifyOTP}
                            disabled={otp.length < 6 || submitting}
                            style={{ marginTop: 16 }}
                        >
                            Verify OTP
                        </Button>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={{ marginTop: 16, marginBottom: 8 }}>
                            Type: <Text style={{ fontWeight: "bold" }}>{`Deactivate ${storeName}`}</Text> to confirm.
                        </Text>
                        <TextInput
                            placeholder={`Deactivate ${storeName}`}
                            // value={confirmationText}
                            onChangeText={setConfirmationText}
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                padding: 8,
                                borderRadius: 4,
                                marginBottom: 16,
                            }}
                        />
                        <View style={{flexDirection: "row", justifyContent: "center"}}>
                        <Button
                            mode="contained"
                            onPress={handleDeactivateStore}
                            disabled={submitting}
                        >
                            Confirm Deactivation
                        </Button>
                        </View>
                    </>
                )}

                <View style={{flexDirection: "row", justifyContent: "center"}}>
                <Button
                    mode="outlined"
                    onPress={handleCancel}
                    style={{ marginTop: 16 }}
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
        padding: 16,
        backgroundColor: "white",
        borderRadius: 8,
    },
});