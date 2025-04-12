// app/Authentication/index.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput as PaperTextInput, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setPhone, setAuthenticationStatus, clearPendingRequest, clearRedirectAfterAuth } from '../../store/authSlice';
import axiosClient from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setMerchant } from '../../store/merchantSlice';
import { useRouter } from 'expo-router';
import OtpInput from '../../components/OtpInput';
import LogoIconWithName from "../../components/LogoIconWithName";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import PhoneInput from "../../components/PhoneInput";
import {setAllStores} from "../../store/allStoresSlice";

const Authentication = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const theme = useTheme();

    const phone = useSelector((state) => state.auth.phone);
    const authenticationStatus = useSelector((state) => state.auth.authenticationStatus);
    const pendingRequest = useSelector((state) => state.auth.pendingRequestConfig);
    const redirectAfterAuth = useSelector((state) => state.auth.redirectAfterAuth);
    const selectedStoreId = useSelector((state) => state.store.storeId);
    const insets = useSafeAreaInsets();
    const [localPhone, setLocalPhone] = useState(phone);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState(false);
    const [name, setName] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [tooManyAttempts, setTooManyAttempts] = useState(false);
    const [merchantName, setMerchantName] = useState(null);

    const sendOtp = async () => {
        if (localPhone) {
            try {
                dispatch(setAuthenticationStatus('LOADING'));
                setOtpError(false);
                const res = await axiosClient.post('/auth/sendOtp', {phone: localPhone, app: 'merchant'});
                setIsRegistered(res.data.isRegistered);
                setTooManyAttempts(false);
                dispatch(setPhone(localPhone));
                dispatch(setAuthenticationStatus('OTP_SENT'));
            } catch (err) {
                console.error('Failed to send OTP:', err);
                dispatch(setAuthenticationStatus('UNAUTHENTICATED'));
            }
        }
    };

    const validateOtp = async (otp) => {
        try {
            setOtp(otp);
            dispatch(setAuthenticationStatus('LOADING'));
            await axiosClient.post('/auth/verifyOtp', { phone: localPhone, otp, app: 'merchant' });

            if (isRegistered) {
                const res = await axiosClient.post('/auth/merchantLogin', { phone: localPhone, otp, app: 'merchant' });
                const { accessToken, merchant, stores } = res.data;
                await AsyncStorage.setItem('accessToken', accessToken);
                setMerchantName(merchant.fullName);
                dispatch(setMerchant(merchant));
                dispatch(setAllStores( {stores}))
                dispatch(setAuthenticationStatus('AUTHENTICATED'));
            } else {
                dispatch(setAuthenticationStatus('COLLECT_NAME'));
            }

            return true;
        } catch (err) {
            console.error('Invalid OTP', err);
            if (err.response?.status === 429) {
                // Too many failed attempts
                setTooManyAttempts(true);
                // Alert.alert('Error', 'Too many failed attempts. Please request a new OTP.');
                dispatch(setAuthenticationStatus('UNAUTHENTICATED'));
            } else {
                setOtpError(true);
                setOtp('');
                dispatch(setAuthenticationStatus('OTP_SENT'));
            }
            return false;
        }
    };

    const registerUser = async (address) => {
        try {
            dispatch(setAuthenticationStatus('LOADING'));
            const res = await axiosClient.post('/auth/register', {
                phone: localPhone,
                otp: otp,
                fullName: name,
                app: 'merchant'
            });
            const { accessToken, merchant, stores } = res.data;
            await AsyncStorage.setItem('accessToken', accessToken);
            setMerchantName(merchant.fullName);
            dispatch(setMerchant(merchant));
            dispatch(setAllStores( {stores}));
            dispatch(setAuthenticationStatus('AUTHENTICATED'));
            setOtp('');
        } catch (err) {
            console.error('Failed to register user:', err);
        }
    };

    useEffect(() => {
        console.log('useEffect authenticationStatus:', authenticationStatus);
        if (authenticationStatus === 'AUTHENTICATED') {
            const completeAuthFlow = async () => {
                console.log('completeAuthFlow');
                console.log('pendingRequest:', pendingRequest);
                if (pendingRequest) {
                    console.log('retrying pending request:')
                    try {
                        await axiosClient(pendingRequest);
                    } catch (err) {
                        console.error('Retried request failed:', err);
                    } finally {
                        dispatch(clearPendingRequest());
                    }
                }
                console.log('redirectAfterAuth:', redirectAfterAuth);
                if (redirectAfterAuth) {
                    console.log('redirecting to:', redirectAfterAuth);
                    setTimeout(()=> {
                        router.replace(redirectAfterAuth);
                        dispatch(clearRedirectAfterAuth());
                    }, 2000)

                } else if (selectedStoreId) {
                    router.replace('/Main/(tabs)/Dashboard');
                } else {
                    router.replace('/StoreSelector');
                }
            };

            completeAuthFlow();
        }
    }, [authenticationStatus]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: 'white' }}
            contentContainerStyle={{ backgroundColor: 'white'}}
        >
            <ScrollView
                contentContainerStyle={[styles.container, { paddingTop: 0, paddingBottom: insets.bottom + 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.inner}>
                    <LogoIconWithName style={{ marginBottom: 20 }} />

                    {authenticationStatus === 'UNAUTHENTICATED' && (
                        <View style={styles.section}>
                            <Text variant="titleMedium" style={styles.heading}>
                                Enter Phone Number
                            </Text>
                            <View style={styles.row}>
                                <PhoneInput
                                    setPhone={setLocalPhone}
                                />
                                <Button
                                    mode="contained"
                                    onPress={sendOtp}
                                    style={styles.button}
                                >
                                    {tooManyAttempts ? 'Resend OTP' : 'Verify'}
                                </Button>
                            </View>
                            {tooManyAttempts && <Text style={{ color: theme.colors.error }}>Too many failed attempts. Please request a new OTP.</Text>}
                        </View>
                    )}

                    {authenticationStatus === 'OTP_SENT' && (
                        <View style={styles.section}>
                            <Text variant="titleMedium" style={styles.heading}>
                                Enter OTP
                            </Text>
                            <OtpInput otpLength={6} onSubmit={validateOtp} />
                            {otpError && (
                                <Text style={{ color: theme.colors.error }}>
                                    Invalid OTP. Please try again.
                                </Text>
                            )}
                        </View>
                    )}


                    {authenticationStatus === 'COLLECT_NAME' && (
                        <View style={styles.section}>
                            <Text variant="titleMedium" style={styles.heading}>
                                Enter Your Name
                            </Text>
                            <PaperTextInput
                                label="Full Name"
                                mode="outlined"
                                onChangeText={setName}
                                style={[{ marginBottom: 16 }, styles.input]}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                            <Button
                                mode="contained"
                                onPress={() => registerUser()}
                                style={{ backgroundColor: theme.colors.primary, borderRadius: 8 }}
                            >
                                Register
                            </Button>
                            </View>
                        </View>
                    )}

                    {merchantName && <Text variant={"titleLarge"}>{'Welcome, ' + merchantName + '!'}</Text>}

                    {authenticationStatus === 'LOADING' && (
                        <ActivityIndicator
                            animating={true}
                            size="large"
                            color={theme.colors.primary}
                        />
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        minHeight: '100%',     // <--- Fix vertical centering
        paddingHorizontal: 20,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    inner: {
        alignItems: 'center', // Center logo & sections horizontally
        width: '100%',
        backgroundColor: 'white',
    },
    section: {
        alignSelf: 'stretch',
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',

    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: "space-between",
    },
    button: {
        borderRadius: 8,
        marginTop: 4
    },
    heading: {
        marginBottom: 4,
    },
    input: {
        backgroundColor: 'white',
    }
});

export default Authentication;