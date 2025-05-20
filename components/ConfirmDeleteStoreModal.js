import React, { useState } from "react";
import { View, StyleSheet, Alert, TextInput } from "react-native";
import { Text, Button, Modal, Portal, useTheme } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { getAxiosClient } from "../api/client";
import OtpInput from "../components/OtpInput";
import { useQueryClient } from "react-query";
import {clearStore, setStore} from "../store/storeSlice";
import {useRouter} from "expo-router";

export default function ConfirmDeleteStoreModal({ visible, onDismiss, storeId, storeName }) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const router = useRouter();
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
                phone, context: 'DELETE_STORE', storeId: store.storeId
            });
            setOtpSent(true);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to send OTP.");
        }
    };

    const handleVerifyOTP = async () => {
        try {
            await axiosClient.post(`/verifyOtp`, { phone, otp, context: 'DELETE_STORE'});
            setOtpVerified(true);
        } catch (err) {
            console.error(err);
            setOtpVerified(false);
            Alert.alert("Error", "Failed to verify OTP.");
        }
    };

    console.log('confirmationText:', confirmationText)
    const handleDeleteStore = async () => {
        try {
            if (confirmationText !== `Delete ${storeName}`) {
                Alert.alert("Error", `Please type 'Delete ${storeName}' to confirm.`);
                return;
            }

            setSubmitting(true);
            await axiosClient.post(`/stores/${storeId}/deleteStore`, { phone, otp });
            dispatch(clearStore());
            Alert.alert("Success", "Store has been deleted.");
            router.replace('/StoreSelector?exitToLogout=true')
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
                <Text variant="titleMedium" style={{ marginBottom: 16, textAlign: "center" , color: theme.colors.error}}>
                    Are you sure you want to delete this store? This action cannot be undone.
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
                            Type: <Text style={{ fontWeight: "bold" }}>{`Delete ${storeName}`}</Text> to confirm.
                        </Text>
                        <TextInput
                            placeholder={`Delete ${storeName}`}
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
                            buttonColor={theme.colors.error}
                            onPress={handleDeleteStore}
                            disabled={submitting}
                        >
                            Confirm Store Deletion
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