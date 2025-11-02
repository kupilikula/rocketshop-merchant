// app/components/AuthFormMerchant.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform, Keyboard } from 'react-native';
import { Text, TextInput as PaperTextInput, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { useDispatch } from 'react-redux';

// Adjust paths for these imports
import {
    setAuthenticationStatus as setGlobalAuthProcessStatus,
} from '../store/authSlice';
import { getAxiosClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setMerchant } from '../store/merchantSlice';
import { setAllStores } from '../store/allStoresSlice';
import OtpInput from './OtpInput';
import LogoIconWithName from "./LogoIconWithName";
import PhoneInput from "./PhoneInput";
import {formatPhone} from "../utils/identifierUtils";

const IS_WEB = Platform.OS === 'web';

export const AUTH_METHODS = {
    PHONE: 'PHONE',
    EMAIL: 'EMAIL',
};

export const AUTH_STEPS = {
    IDENTIFIER_INPUT: 'IDENTIFIER_INPUT',
    OTP_INPUT: 'OTP_INPUT',
    NAME_INPUT: 'NAME_INPUT',
    LOADING: 'LOADING', // This step is used if a full screen loader is needed between actual steps
    SUCCESS_MESSAGE: 'SUCCESS_MESSAGE'
};

const AuthFormMerchant = ({
                              onAuthSuccess,
                              onCancelFlow,
                              initialIdentifierFromState = '',
                          }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
    const styles = useMemo(() => makeStyles(theme, IS_WEB), [theme, IS_WEB]);

    // ... (State variables remain the same) ...
    const [currentStep, setCurrentStep] = useState(AUTH_STEPS.IDENTIFIER_INPUT);
    const [authMethod, setAuthMethod] = useState(AUTH_METHODS.PHONE);
    const [localIdentifier, setLocalIdentifier] = useState(
        authMethod === AUTH_METHODS.PHONE ? initialIdentifierFromState : ''
    );
    const [otp, setOtp] = useState('');
    const [otpDisplay, setOtpDisplay] = useState('');
    const [otpError, setOtpError] = useState(false);
    const [name, setName] = useState('');
    const [isRegisteredUser, setIsRegisteredUser] = useState(false);
    const [tooManyAttempts, setTooManyAttempts] = useState(false);
    const [isLoadingStep, setIsLoadingStep] = useState(false); // This controls the general loading overlay
    const [finalMerchantName, setFinalMerchantName] = useState('');


    const formattedIdentifier = useMemo(() => {
        // ... (formattedIdentifier logic) ...
        if (authMethod === AUTH_METHODS.PHONE) {
            return formatPhone(localIdentifier);
        } else {
            if (typeof localIdentifier === 'string') {
                return localIdentifier.trim();
            }
            return localIdentifier;
        }
    }, [localIdentifier, authMethod]);

    useEffect(() => {
        // ... (useEffect logic) ...
        if (currentStep === AUTH_STEPS.IDENTIFIER_INPUT) {
            if (authMethod === AUTH_METHODS.PHONE) {
                setLocalIdentifier(initialIdentifierFromState);
            } else {
                setLocalIdentifier('');
            }
            setOtpError(false);
            setTooManyAttempts(false);
            setName('');
        }
    }, [authMethod, currentStep, initialIdentifierFromState]);

    const handleToggleAuthMethod = useCallback(() => {
        // ... (handleToggleAuthMethod logic) ...
        setAuthMethod(prevMethod => {
            const newMethod = prevMethod === AUTH_METHODS.PHONE ? AUTH_METHODS.EMAIL : AUTH_METHODS.PHONE;
            setLocalIdentifier(newMethod === AUTH_METHODS.PHONE ? initialIdentifierFromState : '');
            setOtpError(false);
            setTooManyAttempts(false);
            setName('');
            Keyboard.dismiss();
            return newMethod;
        });
    }, [initialIdentifierFromState]);

    const handleSendOtp = useCallback(async () => {
        // ... (handleSendOtp implementation) ...
        if (!formattedIdentifier || !formattedIdentifier.trim()) {
            setOtpError(true);
            return;
        }
        if (authMethod === AUTH_METHODS.EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formattedIdentifier)) {
            setOtpError(true);
            return;
        }
        setIsLoadingStep(true);
        setOtpError(false);
        setTooManyAttempts(false);
        const requestBody = {
            identifier: formattedIdentifier,
            type: authMethod === AUTH_METHODS.PHONE ? 'phone' : 'email',
            context: 'AUTH_LOGIN',
            app: 'merchant'
        };
        try {
            const res = await axiosClient.post('/auth/send-otp', requestBody);
            setIsRegisteredUser(res.data.isRegistered);
            // dispatch(setGlobalAuthIdentifier(formattedIdentifier));
            setCurrentStep(AUTH_STEPS.OTP_INPUT);
        } catch (err) {
            console.error('Merchant Auth: Failed to send OTP:', err.response ? err.response.data : err.message);
            if (err.response?.status === 429) {
                setTooManyAttempts(true);
            } else {
                setOtpError(true);
            }
        } finally {
            setIsLoadingStep(false);
        }
    }, [formattedIdentifier, authMethod, dispatch, axiosClient]);

    const handleValidateOtp = useCallback(async (submittedOtpValue) => {
        // ... (handleValidateOtp implementation) ...
        setIsLoadingStep(true);
        setOtpError(false);
        setTooManyAttempts(false);
        const verifyRequestBody = {
            identifier: formattedIdentifier,
            type: authMethod === AUTH_METHODS.PHONE ? 'phone' : 'email',
            otp: submittedOtpValue,
            context: 'AUTH_LOGIN',
            app: 'merchant'
        };
        try {
            await axiosClient.post('/auth/verify-otp', verifyRequestBody);
            setOtp(submittedOtpValue);
            if (isRegisteredUser) {
                const loginRequestBody = {
                    identifier: formattedIdentifier,
                    type: authMethod === AUTH_METHODS.PHONE ? 'phone' : 'email',
                    otp: submittedOtpValue
                };
                const res = await axiosClient.post('/auth/login', loginRequestBody);
                const { accessToken, merchant, stores } = res.data;
                await AsyncStorage.setItem('accessToken', accessToken);
                dispatch(setMerchant(merchant));
                dispatch(setAllStores({ stores }));
                dispatch(setGlobalAuthProcessStatus('AUTHENTICATED'));
                setFinalMerchantName(merchant.fullName);
                setCurrentStep(AUTH_STEPS.SUCCESS_MESSAGE);
                setOtpDisplay('');
                if (onAuthSuccess) {
                    onAuthSuccess({ merchant, accessToken, stores });
                }
            } else {
                setCurrentStep(AUTH_STEPS.NAME_INPUT);
                setOtpDisplay('');
            }
        } catch (err) {
            console.error('Merchant Auth: Invalid OTP or Login/Verification failed:', err.response ? err.response.data : err.message);
            setOtpDisplay('');
            if (err.response?.status === 429) {
                setTooManyAttempts(true);
            } else {
                setOtpError(true);
            }
        } finally {
            setIsLoadingStep(false);
        }
    }, [formattedIdentifier, authMethod, isRegisteredUser, dispatch, axiosClient, onAuthSuccess, setGlobalAuthProcessStatus, setMerchant, setAllStores]); // Added missing dependencies

    const handleRegisterMerchant = useCallback(async () => {
        // ... (handleRegisterMerchant implementation) ...
        if (!name.trim()) {
            return;
        }
        setIsLoadingStep(true);
        const requestBody = {
            identifier: formattedIdentifier,
            type: authMethod === AUTH_METHODS.PHONE ? 'phone' : 'email',
            otp: otp,
            fullName: name.trim(),
            app: 'merchant'
        };
        try {
            const res = await axiosClient.post('/auth/register', requestBody);
            const { accessToken, merchant, stores } = res.data;
            await AsyncStorage.setItem('accessToken', accessToken);
            dispatch(setMerchant(merchant));
            dispatch(setAllStores({ stores }));
            dispatch(setGlobalAuthProcessStatus('AUTHENTICATED'));
            setFinalMerchantName(merchant.fullName);
            setCurrentStep(AUTH_STEPS.SUCCESS_MESSAGE);
            if (onAuthSuccess) {
                onAuthSuccess({ merchant, accessToken, stores });
            }
        } catch (err) {
            console.error('Merchant Auth: Failed to register merchant:', err.response ? err.response.data : err.message);
            setCurrentStep(AUTH_STEPS.NAME_INPUT);
        } finally {
            setIsLoadingStep(false);
        }
    }, [name, formattedIdentifier, authMethod, otp, dispatch, axiosClient, onAuthSuccess, setGlobalAuthProcessStatus, setMerchant, setAllStores]); // Added missing dependencies

    const handleCancelRegistration = useCallback(() => {
        // ... (handleCancelRegistration implementation) ...
        console.log("Registration Cancelled by user.");
        setName('');
        setOtp('');
        setOtpDisplay('');
        setCurrentStep(AUTH_STEPS.IDENTIFIER_INPUT);
        if (onCancelFlow) {
            onCancelFlow();
        }
    }, [onCancelFlow]); // Removed unused dependencies for this simpler version


    // --- UI Rendering ---

    // Primary Loading Indicator: If isLoadingStep is true, show loader instead of form steps
    // (unless it's the success message, which has its own brief display)
    if (isLoadingStep && currentStep !== AUTH_STEPS.SUCCESS_MESSAGE) {
        return (
            <View style={styles.authFormWrapper}>
                <LogoIconWithName style={{ marginBottom: IS_WEB ? 40 : 30, alignSelf: 'center' }} />
                <View style={styles.centeredContent}>
                    <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.authFormWrapper}>
            <LogoIconWithName style={{ marginBottom: IS_WEB ? 40 : 30, alignSelf: 'center' }} />

            {currentStep === AUTH_STEPS.IDENTIFIER_INPUT && (
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.heading}>
                        {authMethod === AUTH_METHODS.PHONE ? 'Enter Merchant Phone' : 'Enter Merchant Email'}
                    </Text>
                    <View style={styles.inputRow}>
                        {authMethod === AUTH_METHODS.PHONE ? (
                            <PhoneInput
                                setPhone={setLocalIdentifier}
                                initialValue={localIdentifier}
                                style={styles.flexInput}
                            />
                        ) : (
                            <PaperTextInput
                                label="Email Address"
                                mode="outlined"
                                value={localIdentifier}
                                onChangeText={setLocalIdentifier}
                                style={[styles.textInputStyle, styles.flexInput]}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                // disabled={isLoadingStep} // isLoadingStep is for the main loader, button handles its own disable
                            />
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16}}>
                        <Button mode="contained" onPress={handleSendOtp} style={styles.button} disabled={isLoadingStep || !localIdentifier}>
                            {isLoadingStep ? <ActivityIndicator size="small" color={theme.colors.onPrimary}/> : (tooManyAttempts ? 'Resend OTP' : 'Verify')}
                        </Button>
                    </View>
                    {(otpError && currentStep === AUTH_STEPS.IDENTIFIER_INPUT && !tooManyAttempts) && (
                        <Text style={styles.errorText}>
                            {authMethod === AUTH_METHODS.EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formattedIdentifier) && localIdentifier.trim().length > 0
                                ? 'Invalid email format.'
                                : 'Failed to send OTP. Please check details and try again.'}
                        </Text>
                    )}
                    {(tooManyAttempts && currentStep === AUTH_STEPS.IDENTIFIER_INPUT) && (
                        <Text style={styles.errorText}>
                            {`Too many attempts to send OTP for this ${authMethod === AUTH_METHODS.PHONE ? 'number' : 'email'}. Please try again later.`}
                        </Text>
                    )}
                    <View style={styles.toggleButtonContainer}>
                        <Button
                            mode="text"
                            onPress={handleToggleAuthMethod}
                            textColor={theme.colors.primary}
                            disabled={isLoadingStep} // Disable toggle if main loader is active
                        >
                            {authMethod === AUTH_METHODS.PHONE ? 'Use Email Instead' : 'Use Phone Number Instead'}
                        </Button>
                    </View>
                </View>
            )}

            {currentStep === AUTH_STEPS.OTP_INPUT && (
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.heading}>
                        {`Enter OTP sent to ${formattedIdentifier}`}
                    </Text>
                    <OtpInput
                        otpLength={6}
                        onSubmit={handleValidateOtp}
                        key={otpError || tooManyAttempts ? `otp-error-${Date.now()}` : `otp-input-${Date.now()}`}
                        value={otpDisplay}
                        onTextChange={setOtpDisplay}
                        autoFocus={true}
                        // disabled={isLoadingStep} // OtpInput might not have a disabled prop, handled by main loader
                    />
                    {otpError && currentStep === AUTH_STEPS.OTP_INPUT && (
                        <Text style={styles.errorText}>Invalid OTP. Please try again.</Text>
                    )}
                    {tooManyAttempts && currentStep === AUTH_STEPS.OTP_INPUT && (
                        <Text style={styles.errorText}>
                            Too many failed attempts for this OTP. Please request a new one.
                        </Text>
                    )}
                    <View style={styles.changeIdentifierContainer}>
                        <Button
                            mode="text"
                            onPress={() => {
                                setOtpError(false);
                                setTooManyAttempts(false);
                                setOtpDisplay('');
                                setCurrentStep(AUTH_STEPS.IDENTIFIER_INPUT);
                            }}
                            textColor={theme.colors.primary}
                            disabled={isLoadingStep} // Disable if main loader active
                        >
                            Change {authMethod === AUTH_METHODS.PHONE ? 'Phone Number' : 'Email Address'}
                        </Button>
                    </View>
                </View>
            )}

            {currentStep === AUTH_STEPS.NAME_INPUT && (
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.heading}>Enter Your Full Name</Text>
                    <PaperTextInput
                        label="Full Name"
                        mode="outlined"
                        value={name}
                        onChangeText={setName}
                        style={styles.textInputStyle}
                        // disabled={isLoadingStep} // Handled by main loader
                        autoFocus={true}
                    />
                    <View style={styles.buttonRow}>
                        <Button
                            mode="outlined"
                            onPress={handleCancelRegistration}
                            style={[styles.formButton, { borderColor: theme.colors.outline }]}
                            textColor={theme.colors.onSurfaceVariant}
                            // disabled={isLoadingStep} // Handled by main loader
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleRegisterMerchant}
                            style={[styles.formButton, styles.submitButton]}
                            disabled={!name.trim()} // Disable only if name is empty
                            loading={isLoadingStep && currentStep === AUTH_STEPS.NAME_INPUT} // Show loader on button
                            labelStyle={styles.buttonLabel}
                        >
                            Register
                        </Button>
                    </View>
                </View>
            )}


            {currentStep === AUTH_STEPS.SUCCESS_MESSAGE && (
                <View style={styles.sectionSuccess}>
                    <Text variant={"titleLarge"} style={styles.successMessageText}>
                        Welcome, {finalMerchantName || 'Merchant'}!
                    </Text>
                </View>
            )}
        </View>
    );
};

const makeStyles = (theme, isWeb) => StyleSheet.create({
    // ... (Existing styles) ...
    authFormWrapper: {
        padding: 20,
        width: '100%',
        maxWidth: isWeb ? 400 : undefined,
        alignSelf: isWeb ? 'center' : undefined,
        alignItems: 'stretch',
    },
    section: {
        marginBottom: 24,
        width: '100%',
    },
    sectionSuccess: { // Specific styling for success message container
        marginBottom: 24,
        width: '100%',
        alignItems: 'center', // Center the success text
        paddingVertical: 30,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    flexInput: {
        flex: 1,
    },
    textInputStyle: {
        backgroundColor: 'white',
        marginBottom: 16,
    },
    fullWidthButton: {
        borderRadius: 8,
        paddingVertical: isWeb ? 6 : 4,
    },
    buttonLabel: {
        // fontWeight: 'bold',
    },
    toggleButtonContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    changeIdentifierContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    heading: {
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        fontSize: isWeb ? 20 : 18,
    },
    errorText: {
        color: theme.colors.error,
        marginTop: 10,
        textAlign: 'center',
        fontSize: 14,
    },
    centeredContent: { // For the primary full-form loading indicator
        minHeight: 200, // Ensure loader section has some height
        alignItems: 'center',
        justifyContent: 'center',
    },
    successMessageText: {
        textAlign: 'center',
        fontSize: isWeb ? 22 : 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    infoText: { // For text below the success message
        textAlign: 'center',
        fontSize: isWeb ? 15 : 14,
        color: theme.colors.onSurfaceVariant,
    },
    placeholderText: {
        textAlign: 'center',
        padding: 20,
        color: theme.colors.outline,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 24,
    },
    formButton: {
        borderRadius: 8,
        paddingHorizontal: 10,
        flex: 1,
        marginHorizontal: isWeb ? 8 : 5,
        minWidth: isWeb ? 120 : undefined,
    },
    submitButton: {
        // backgroundColor: theme.colors.primary,
    },
    button: {
        borderRadius: 8,
        // marginLeft: 10,
        justifyContent: 'center',
    },
});

export default AuthFormMerchant;