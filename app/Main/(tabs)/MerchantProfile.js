import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card, useTheme } from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import axiosClient from '../../../api/client';
import OtpInput from '../../../components/OtpInput';
import {setMerchant} from "../../../store/merchantSlice";

const MerchantProfileScreen = () => {

    const dispatch = useDispatch();
    const { merchantId, fullName: currentFullName, phone: currentPhone } = useSelector((state) => state.merchant);
    const [mode, setMode] = useState('VIEW'); // 'VIEW' | 'EDIT' | 'VERIFY_OTP'
    const [fullName, setFullName] = useState(currentFullName);
    const [phone, setPhone] = useState(currentPhone);
    const [pendingPhone, setPendingPhone] = useState(null);
    const [otpError, setOtpError] = useState(null);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    console.log(currentFullName, currentPhone);
    const handleSaveChanges = async () => {
        if (phone !== currentPhone) {
            // Phone changed → send OTP
            try {
                setLoading(true);
                await axiosClient.post('/sendOtp', {
                    phone,
                    context: 'UPDATE_PHONE',
                });
                setPendingPhone(phone);
                setMode('VERIFY_OTP');
            } catch (err) {
                Alert.alert('Error', err.response?.data?.error || 'Failed to send OTP');
            } finally {
                setLoading(false);
            }
        } else if (fullName !== currentFullName) {
            // Only fullName changed → update directly
            try {
                setLoading(true);
                const res = await axiosClient.post(`/merchant/${merchantId}/updateProfile`, {
                    fullName,
                });
                dispatch(setMerchant(res.data.merchant));
                setFullName(res.data.merchant.fullName);
                setPhone(res.data.merchant.phone);
                Alert.alert('Success', 'Profile updated');
                setMode('VIEW');
            } catch (err) {
                Alert.alert('Error', err.response?.data?.error || 'Failed to update name');
            } finally {
                setLoading(false);
            }
        } else {
            setMode('VIEW');
        }
    };

    const handleVerifyOtp = async (otp) => {
        try {
            setLoading(true);
            await axiosClient.post('/verifyOtp', {
                phone: pendingPhone,
                otp,
                context: 'UPDATE_PHONE',
            });

            const res = await axiosClient.post(`/merchant/${merchantId}/updateProfile`, {
                fullName,
                phone: pendingPhone,
            });
            dispatch(setMerchant(res.data.merchant));
            Alert.alert('Success', 'Phone number updated');
            setFullName(res.data.merchant.fullName);
            setPhone(res.data.merchant.phone);
            setPendingPhone(null);
            setMode('VIEW');
        } catch (err) {
            setOtpError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="Merchant Profile" />
                <Card.Content>
                    {mode === 'VIEW' && (
                        <View>
                            <Text>Name: {currentFullName}</Text>
                            <Text>Phone: {currentPhone}</Text>
                            <Button mode="contained" style={styles.button} onPress={() => {
                                setPhone(currentPhone);
                                setFullName(currentFullName);
                                setMode('EDIT')
                            }}>
                                Edit Profile
                            </Button>
                        </View>
                    )}

                    {mode === 'EDIT' && (
                        <View>
                            <TextInput
                                label="Full Name"
                                value={fullName}
                                onChangeText={setFullName}
                                mode="outlined"
                                style={styles.input}
                            />
                            <TextInput
                                label="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                                mode="outlined"
                                style={styles.input}
                                keyboardType="phone-pad"
                            />
                            <Button mode="contained" loading={loading} style={styles.button} onPress={handleSaveChanges}>
                                Save Changes
                            </Button>
                            <Button onPress={() => {
                                setPhone(currentPhone);
                                setFullName(currentFullName);
                                setMode('VIEW')
                            }}>Cancel</Button>
                        </View>
                    )}

                    {mode === 'VERIFY_OTP' && (
                        <View>
                            <Text style={{ marginBottom: 8 }}>Enter OTP sent to {pendingPhone}</Text>
                            <OtpInput otpLength={6} onSubmit={handleVerifyOtp} />
                            {otpError && <Text style={{ color: theme.colors.error }}>{otpError}</Text>}
                            <Button onPress={() => setMode('EDIT')}>Go Back</Button>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Future: Store Preferences Section */}
        </View>
    );
};

export default MerchantProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white',
    },
    card: {
        padding: 8,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 12,
    },
});
