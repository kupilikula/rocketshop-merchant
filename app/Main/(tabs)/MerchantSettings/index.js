import React, { useState, useMemo, useEffect } from 'react'; // Added useMemo, useEffect
import { View, StyleSheet, Alert, Platform, ScrollView as DefaultScrollView, useWindowDimensions, ActivityIndicator } from 'react-native'; // Added Platform, DefaultScrollView, useWindowDimensions, ActivityIndicator
import {Text, TextInput, Button, Card, useTheme, Divider} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import { getAxiosClient } from '../../../../api/client';
import OtpInput from '../../../../components/OtpInput'; // Ensure this path is correct
import {setMerchant} from "../../../../store/merchantSlice"; // Ensure this path is correct
import MerchantNotificationPreferences from "../../../../components/MerchantNotificationPreferences"; // Ensure this path is correct
import ScrollableScreen from "../../../../components/ScrollableScreen"; // For mobile

const IS_WEB = Platform.OS === 'web';

const MerchantProfileScreen = () => {
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
    const { merchantId, fullName: currentFullName, phone: currentPhone } = useSelector((state) => state.merchant);
    const theme = useTheme();
    const { width: windowWidth } = useWindowDimensions(); // For makeStyles if needed
    const styles = makeStyles(theme, IS_WEB, windowWidth);

    const [mode, setMode] = useState('VIEW'); // 'VIEW' | 'EDIT' | 'VERIFY_OTP'
    const [fullName, setFullName] = useState(currentFullName || ""); // Ensure initial state is string
    const [phone, setPhone] = useState(currentPhone || "");       // Ensure initial state is string
    const [pendingPhone, setPendingPhone] = useState(null);
    const [otpError, setOtpError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Sync with Redux if currentFullName or currentPhone changes from elsewhere
    useEffect(() => {
        if (mode === 'VIEW') {
            setFullName(currentFullName || "");
            setPhone(currentPhone || "");
        }
    }, [currentFullName, currentPhone, mode]);


    console.log(currentFullName, currentPhone); // Original console.log

    const handleSaveChanges = async () => {
        if (phone !== currentPhone) {
            try {
                setLoading(true);
                setOtpError(null); // Clear previous OTP error
                await axiosClient.post('/sendOtp', { phone, context: 'UPDATE_PHONE' });
                setPendingPhone(phone);
                setMode('VERIFY_OTP');
            } catch (err) {
                Alert.alert('Error', err.response?.data?.error || 'Failed to send OTP. Please check the phone number.');
            } finally {
                setLoading(false);
            }
        } else if (fullName !== currentFullName) {
            try {
                setLoading(true);
                const res = await axiosClient.post(`/merchant/${merchantId}/updateProfile`, { fullName });
                dispatch(setMerchant(res.data.merchant));
                // Update local state from response to be sure
                setFullName(res.data.merchant.fullName);
                setPhone(res.data.merchant.phone);
                Alert.alert('Success', 'Profile name updated successfully.');
                setMode('VIEW');
            } catch (err) {
                Alert.alert('Error', err.response?.data?.error || 'Failed to update name.');
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert('No Changes', 'You haven\'t made any changes to save.');
            setMode('VIEW'); // Or stay in edit mode if preferred
        }
    };

    const handleVerifyOtp = async (otp) => {
        try {
            setLoading(true);
            setOtpError(null);
            await axiosClient.post('/verifyOtp', { phone: pendingPhone, otp, context: 'UPDATE_PHONE' });
            const res = await axiosClient.post(`/merchant/${merchantId}/updateProfile`, { fullName, phone: pendingPhone });
            dispatch(setMerchant(res.data.merchant));
            Alert.alert('Success', 'Profile updated successfully!');
            setFullName(res.data.merchant.fullName);
            setPhone(res.data.merchant.phone);
            setPendingPhone(null);
            setMode('VIEW');
        } catch (err) {
            setOtpError(err.response?.data?.error || 'Invalid OTP or verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const pageContent = useMemo(() => (
        <>
            <Card style={styles.card}>
                <Card.Title title="Merchant Profile" titleStyle={{fontWeight: 'bold'}} />
                <Card.Content>
                    {mode === 'VIEW' && (
                        <View>
                            <Text variant={"titleMedium"} style={styles.viewLabel}>Name:</Text>
                            <Text variant={"bodyLarge"} style={styles.viewText}>{currentFullName}</Text>
                            <Divider style={styles.viewDivider}/>
                            <Text variant={'titleMedium'} style={styles.viewLabel}>Phone:</Text>
                            <Text variant={'bodyLarge'} style={styles.viewText}>{currentPhone}</Text>
                            <View style={styles.buttonGroup}>
                                <Button
                                    mode="contained"
                                    style={styles.button}
                                    onPress={() => {
                                        setPhone(currentPhone || ""); // Reset to current values
                                        setFullName(currentFullName || "");
                                        setOtpError(null);
                                        setMode('EDIT');
                                    }}
                                    labelStyle={styles.buttonLabel}
                                >
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
                                maxLength={15} // Max length for phone
                            />
                            <View style={styles.actionButtonsRow}>
                                <Button
                                    mode="outlined"
                                    style={[styles.button, styles.cancelButton]}
                                    labelStyle={{color: theme.colors.error}}
                                    onPress={() => {
                                        setPhone(currentPhone || ""); // Reset form to current values
                                        setFullName(currentFullName || "");
                                        setOtpError(null);
                                        setMode('VIEW');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    loading={loading}
                                    style={styles.button}
                                    onPress={handleSaveChanges}
                                    labelStyle={styles.buttonLabel}
                                >
                                    Save Changes
                                </Button>
                            </View>
                        </View>
                    )}

                    {mode === 'VERIFY_OTP' && (
                        <View style={styles.otpContainer}>
                            <Text style={styles.otpPromptText}>
                                Enter OTP sent to <Text style={{fontWeight: 'bold'}}>{pendingPhone}</Text>
                            </Text>
                            <OtpInput otpLength={6} onSubmit={handleVerifyOtp} />
                            {otpError && <Text style={styles.otpErrorText}>{otpError}</Text>}
                            <Button
                                onPress={() => {
                                    setOtpError(null);
                                    // pendingPhone remains as user might want to resend to same number
                                    // Revert phone input field to currentPhone if they go back to edit
                                    setPhone(currentPhone || "");
                                    setMode('EDIT');
                                }}
                                style={styles.otpBackButton}
                                labelStyle={{color: theme.colors.primary}}
                            >
                                Back to Edit
                            </Button>
                        </View>
                    )}
                </Card.Content>
            </Card>

            <Divider style={{marginVertical: 16}}/>
            <MerchantNotificationPreferences/>
        </>
        // Ensure all dependencies that can change and affect `pageContent` are listed
        // This includes state variables, props that might change, and stable functions/objects like styles/theme if necessary.
    ), [mode, fullName, phone, currentFullName, currentPhone, pendingPhone, otpError, loading, styles, theme, handleSaveChanges, handleVerifyOtp]);


    // This screen manages its own internal loading for actions, not a global screen loading state.
    // If initial data for currentFullName/currentPhone from Redux was async, then a global loader might be needed.
    // Assuming Redux state is available synchronously.

    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <DefaultScrollView
                    style={styles.webScrollView_Shell}
                    contentContainerStyle={styles.webScrollViewContentContainer_Shell}
                    keyboardShouldPersistTaps="handled"
                >
                    {pageContent}
                </DefaultScrollView>
            </View>
        );
    } else { // Mobile
        return (
            <ScrollableScreen
                innerStyle={styles.container} // Original prop, using original styles.container
                // backgroundColor is handled by styles.container for mobile
                keyboardShouldPersistTaps="handled" // Assuming ScrollableScreen supports this
            >
                {pageContent}
            </ScrollableScreen>
        );
    }
};

const makeStyles = (theme, isWeb, windowWidth) => { // Added isWeb, windowWidth
    // const { colors } = theme; // Original used theme.colors directly
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container: { // For ScrollableScreen innerStyle on MOBILE
            flex: 1,
            padding: 16,
            backgroundColor: 'white', // Original
        },
        card: { // Original style for Cards
            padding: 8,
            backgroundColor: 'white', // Original
            marginVertical: 16,       // Original
            borderRadius: 0,          // Original
            elevation: IS_WEB ? 2 : 0, // Add elevation for web cards for better separation, mobile keeps original
        },
        input: { // Original style
            marginBottom: 12,
            backgroundColor: 'white', // Original
        },
        button: { // Original style (base for buttons)
            borderRadius: 8,
            paddingHorizontal: 8, // Add some padding to buttons
        },
        buttonLabel: { // For consistent button text
            fontSize: 16,
        },
        // Added styles for VIEW mode for better readability
        viewLabel: {
            // color: theme.colors.onSurfaceVariant, // Subtler color for labels
            // fontSize: 14,
        },
        viewText: {
            marginBottom: 8, // Spacing after value
            fontSize: 16, // Ensure readability
        },
        viewDivider: {
            marginVertical: 8, // Original was 4, increased for better separation
        },
        // Added styles for button groups / rows
        buttonGroup: { // For single centered button
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 24,
        },
        actionButtonsRow: { // For two buttons side-by-side
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between', // Pushes buttons to ends
            alignItems: 'center',
            marginTop: 16,
        },
        cancelButton: { // Specific style for cancel button
            borderColor: theme.colors.error,
            // marginRight: 8, // If space-between is not enough
        },
        // Added styles for OTP section
        otpContainer: {
            alignItems: 'center',
            paddingVertical: 16,
        },
        otpPromptText: {
            marginBottom: 16,
            fontSize: 16,
            textAlign: 'center',
            paddingHorizontal: 10, // Ensure text wraps nicely
        },
        otpErrorText: {
            color: theme.colors.error,
            marginTop: 12,
            textAlign: 'center',
        },
        otpBackButton: {
            marginTop: 20,
        },


        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center', // Centers the shell
        },
        webScrollView_Shell: { // The ScrollView component itself on web
            width: '100%',
            maxWidth: 768, // Max width for settings content
            flex: 1,
            backgroundColor: 'white', // Matches mobile styles.container background
        },
        webScrollViewContentContainer_Shell: { // contentContainerStyle for the web ScrollView
            padding: 16, // Matches mobile styles.container.padding
            flexGrow: 1,
            // justifyContent: 'flex-start', // Default, content starts at top
        },
    });
};

export default MerchantProfileScreen;