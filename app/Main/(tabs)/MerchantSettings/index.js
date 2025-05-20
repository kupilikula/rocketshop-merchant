import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {Text, TextInput, Button, Card, useTheme, Divider} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import { getAxiosClient } from '../../../../api/client';
import OtpInput from '../../../../components/OtpInput';
import {setMerchant} from "../../../../store/merchantSlice";
import MerchantNotificationPreferences from "../../../../components/MerchantNotificationPreferences";
import ScrollableScreen from "../../../../components/ScrollableScreen";

const MerchantProfileScreen = () => {

    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
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
        <ScrollableScreen innerStyle={styles.container}>
            <Card style={styles.card}>
                <Card.Title title="Merchant Profile" />
                <Card.Content>
                    {mode === 'VIEW' && (
                        <View>
                            <Text variant={"titleMedium"}>Name:</Text>
                            <Text variant={"bodyLarge"}>{currentFullName}</Text>
                            <Divider style={{marginVertical: 4}}/>
                            <Text variant={'titleMedium'}>Phone:</Text>
                            <Text variant={'bodyLarge'}>{currentPhone}</Text>
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 16}}>
                            <Button mode="contained" style={styles.button} onPress={() => {
                                setPhone(currentPhone);
                                setFullName(currentFullName);
                                setMode('EDIT')
                            }}>
                                Edit Profile
                            </Button>
                            </View>
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
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <View style={{display: 'flex', flexDirection: 'row', alignSelf: 'center'}}>
                                    <Button
                                        mode="outlined"
                                        style={{borderRadius: 8, borderColor: theme.colors.error}}
                                        labelStyle={{color: theme.colors.error}}
                                        onPress={() => {
                                            setPhone(currentPhone);
                                            setFullName(currentFullName);
                                            setMode('VIEW')
                                        }}>Cancel</Button>
                                </View>

                                <View style={{display: 'flex', flexDirection: 'row', alignSelf: 'center'}}>
                            <Button mode="contained" loading={loading} style={styles.button} onPress={handleSaveChanges}>
                                Save Changes
                            </Button>
                            </View>
                            </View>
                        </View>
                    )}

                    {mode === 'VERIFY_OTP' && (
                        <View>
                            <Text style={{ marginBottom: 8 }}>Enter OTP sent to {pendingPhone}</Text>
                            <OtpInput otpLength={6} onSubmit={handleVerifyOtp} />
                            {otpError && <Text style={{ color: theme.colors.error }}>{otpError}</Text>}
                            <Button onPress={() => {
                                setOtpError(null);
                                setMode('EDIT')
                            }
                            }>Go Back</Button>
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Future: Store Preferences Section */}
            <MerchantNotificationPreferences/>
        </ScrollableScreen>
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
        backgroundColor: 'white',
        marginVertical: 16,
        borderRadius: 0,
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'white',
    },
    button: {
        // marginTop: 12,
        borderRadius: 8,
    },
});
