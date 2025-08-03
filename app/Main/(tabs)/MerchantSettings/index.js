import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import {Text, TextInput, Button, Card, useTheme, Divider, Menu, HelperText, Title} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation } from 'react-query';

import { getAxiosClient } from '../../../../api/client';
import OtpInput from '../../../../components/OtpInput';
import { setMerchant } from "../../../../store/merchantSlice";
import MerchantNotificationPreferences from "../../../../components/MerchantNotificationPreferences";
import ScrollableScreen from "../../../../components/ScrollableScreen";
import { business_types } from '../../../../utils/razorpayBusinessData';
import {useGetRazorpayStatus} from "../../../../api/hooks/useGetRazorpayStatus";

const IS_WEB = Platform.OS === 'web';

const formatLabel = (str) => {
    if (!str) return '';
    const spaced = str.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1');
    return spaced.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const businessTypeOptions = business_types.map(type => ({ label: formatLabel(type), value: type }));

// --- Helper component to display locked fields clearly ---
const LockedDetailRow = ({ label, value }) => {
    const styles = makeStyles(useTheme(), IS_WEB);
    return (
        <View style={styles.lockedRow}>
            <Text style={styles.viewLabel}>{label}:</Text>
            <Text style={styles.viewText} numberOfLines={1}>{value || 'Not Set'}</Text>
        </View>
    );
};

export default function MerchantProfileScreen() {
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
    const theme = useTheme();
    const styles = makeStyles(theme, IS_WEB);

    const { storeId } = useSelector((state) => state.store);
    const {
        merchantId,
        fullName: currentFullName,
        phone: currentPhone,
        legalBusinessName: currentLegalName,
        businessType: currentBizType
    } = useSelector((state) => state.merchant);

    const { data: paymentStatus, isLoading: isStatusLoading } = useGetRazorpayStatus(storeId);
    const isFinancialProfileLocked = paymentStatus?.isFinancialProfileLocked || false;

    const [mode, setMode] = useState('VIEW');
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState(currentFullName || "");
    const [phone, setPhone] = useState(currentPhone || "");
    const [legalBusinessName, setLegalBusinessName] = useState(currentLegalName || "");
    const [selectedBusinessType, setSelectedBusinessType] = useState(currentBizType || "");
    const [businessTypeMenuVisible, setBusinessTypeMenuVisible] = useState(false);

    const [pendingPhone, setPendingPhone] = useState(null);
    const [otpError, setOtpError] = useState(null);

    useEffect(() => {
        if (mode === 'VIEW') {
            setFullName(currentFullName || "");
            setPhone(currentPhone || "");
            setLegalBusinessName(currentLegalName || "");
            setSelectedBusinessType(currentBizType || "");
        }
    }, [currentFullName, currentPhone, currentLegalName, currentBizType, mode]);

    const hasChanges = useMemo(() => {
        return fullName !== currentFullName ||
            phone !== currentPhone ||
            legalBusinessName !== currentLegalName ||
            selectedBusinessType !== currentBizType;
    }, [fullName, phone, legalBusinessName, selectedBusinessType, currentFullName, currentPhone, currentLegalName, currentBizType]);

    const handleSaveChanges = async () => {
        if (!hasChanges) {
            Alert.alert('No Changes', "You haven't made any changes to save.");
            return setMode('VIEW');
        }

        setLoading(true);
        setOtpError(null);

        const updatePayload = {
            fullName,
            legalBusinessName: isFinancialProfileLocked ? undefined : legalBusinessName,
            businessType: isFinancialProfileLocked ? undefined : selectedBusinessType,
        };

        if (phone !== currentPhone) {
            try {
                await axiosClient.post('/sendOtp', { phone, context: 'UPDATE_PHONE' });
                setPendingPhone(phone);
                setMode('VERIFY_OTP');
            } catch (err) {
                Alert.alert('Error', err.response?.data?.error || 'Failed to send OTP.');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const res = await axiosClient.post(`/merchants/${merchantId}/updateProfile`, updatePayload);
                dispatch(setMerchant(res.data.merchant));
                Alert.alert('Success', 'Profile updated successfully.');
                setMode('VIEW');
            } catch (err) {
                Alert.alert('Error', err.response?.data?.error || 'Failed to update profile.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyOtp = async (otp) => {
        try {
            setLoading(true);
            setOtpError(null);
            await axiosClient.post('/verifyOtp', { phone: pendingPhone, otp, context: 'UPDATE_PHONE' });

            const updatePayload = {
                fullName,
                phone: pendingPhone,
                legalBusinessName: isFinancialProfileLocked ? undefined : legalBusinessName,
                businessType: isFinancialProfileLocked ? undefined : selectedBusinessType
            };

            const res = await axiosClient.post(`/merchants/${merchantId}/updateProfile`, updatePayload);
            dispatch(setMerchant(res.data.merchant));
            Alert.alert('Success', 'Profile updated successfully!');
            setPendingPhone(null);
            setMode('VIEW');
        } catch (err) {
            setOtpError(err.response?.data?.error || 'Invalid OTP or verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const pageContent = useMemo(() => {
        if (isStatusLoading) {
            return <ActivityIndicator size="large" style={{marginTop: 50}} />;
        }

        return (
            <>
                <Card style={styles.card}>
                    <Card.Title title="Merchant Profile" titleStyle={{fontWeight: 'bold'}} />
                    <Card.Content>
                        {mode === 'VIEW' && (
                            <View>
                                <LockedDetailRow label="Display Name" value={currentFullName} />
                                <LockedDetailRow label="Legal Business Name" value={currentLegalName} />
                                <LockedDetailRow label="Business Type" value={formatLabel(currentBizType)} />
                                <LockedDetailRow label="Contact Phone" value={currentPhone} />
                                <View style={styles.buttonGroup}>
                                    <Button mode="contained" style={styles.button} onPress={() => setMode('EDIT')}>Edit Profile</Button>
                                </View>
                            </View>
                        )}

                        {mode === 'EDIT' && (
                            <View>
                                <Title style={styles.formSectionTitle}>Editable Details</Title>
                                <TextInput label="Display Name" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
                                <TextInput label="Contact Phone Number" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} keyboardType="phone-pad" />

                                <Divider style={styles.divider}/>
                                <Title style={styles.formSectionTitle}>Financial Details</Title>

                                {isFinancialProfileLocked ? (
                                    <View style={styles.lockedContainer}>
                                        <LockedDetailRow label="Legal Business Name" value={currentLegalName} />
                                        <LockedDetailRow label="Business Type" value={formatLabel(currentBizType)} />
                                        <Text style={styles.lockedInfoText}>To update legal or financial details after verification, please contact support.</Text>
                                    </View>
                                ) : (
                                    <>
                                        <TextInput label="Legal Business Name" value={legalBusinessName} onChangeText={setLegalBusinessName} mode="outlined" style={styles.input} />
                                        <Menu visible={businessTypeMenuVisible} onDismiss={() => setBusinessTypeMenuVisible(false)} anchor={<Button mode="outlined" style={styles.dropdownAnchor} onPress={() => setBusinessTypeMenuVisible(true)}>{formatLabel(selectedBusinessType) || 'Select Business Type'}</Button>}>
                                            {businessTypeOptions.map(option => <Menu.Item key={option.value} onPress={() => { setSelectedBusinessType(option.value); setBusinessTypeMenuVisible(false); }} title={option.label} />)}
                                        </Menu>
                                    </>
                                )}

                                <View style={styles.actionButtonsRow}>
                                    <Button mode="outlined" style={styles.cancelButton} labelStyle={{color: theme.colors.error}} onPress={() => setMode('VIEW')}>Cancel</Button>
                                    <Button mode="contained" loading={loading} style={styles.button} onPress={handleSaveChanges}>Save Changes</Button>
                                </View>
                            </View>
                        )}

                        {mode === 'VERIFY_OTP' && (
                            <View style={styles.otpContainer}><Text style={styles.otpPromptText}>Enter OTP sent to <Text style={{fontWeight: 'bold'}}>{pendingPhone}</Text></Text><OtpInput otpLength={6} onSubmit={handleVerifyOtp} />{otpError && <Text style={styles.otpErrorText}>{otpError}</Text>}<Button onPress={() => { setOtpError(null); setPhone(currentPhone || ""); setMode('EDIT'); }} style={styles.otpBackButton} labelStyle={{color: theme.colors.primary}}>Back to Edit</Button></View>
                        )}
                    </Card.Content>
                </Card>

                <Divider style={{marginVertical: 16}}/>
                <MerchantNotificationPreferences/>
            </>
        )
    }, [mode, fullName, phone, legalBusinessName, selectedBusinessType, currentFullName, currentPhone, currentLegalName, currentBizType, pendingPhone, otpError, loading, isStatusLoading, isFinancialProfileLocked, styles, theme]);

    const Wrapper = IS_WEB ? View : ScrollableScreen;
    const wrapperProps = IS_WEB ? { style: styles.webPageContainer_Root } : { innerStyle: styles.container };

    return (
        <Wrapper {...wrapperProps}>
            {IS_WEB ? <ScrollView contentContainerStyle={styles.webScrollViewContentContainer_Shell} keyboardShouldPersistTaps="handled">{pageContent}</ScrollView> : pageContent}
        </Wrapper>
    );
};

const makeStyles = (theme, isWeb) => StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: 'white' },
    webPageContainer_Root: { flex: 1, backgroundColor: '#f4f5f7', alignItems: 'center' },
    webScrollViewContentContainer_Shell: { width: '100%', maxWidth: 768, padding: 16, },
    card: { padding: 8, backgroundColor: 'white', marginVertical: 16, borderRadius: 8, elevation: isWeb ? 2 : 0, borderWidth: isWeb ? 1 : 0, borderColor: '#e0e0e0' },
    input: { marginBottom: 12, backgroundColor: 'white' },
    button: { borderRadius: 8, paddingHorizontal: 8 },
    viewLabel: { color: theme.colors.onSurfaceVariant, fontSize: 14 },
    viewText: { fontSize: 16, color: theme.colors.onSurface, fontWeight: '500', marginBottom: 16 },
    viewDivider: { marginBottom: 16 },
    buttonGroup: { display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
    actionButtonsRow: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
    cancelButton: { borderColor: theme.colors.error },
    otpContainer: { alignItems: 'center', paddingVertical: 16 },
    otpPromptText: { marginBottom: 16, fontSize: 16, textAlign: 'center' },
    otpErrorText: { color: theme.colors.error, marginTop: 12, textAlign: 'center' },
    otpBackButton: { marginTop: 20 },
    formSectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 16 },
    dropdownAnchor: { backgroundColor: 'white', marginTop: 8, height: 56, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderRadius: 4, borderColor: theme.colors.outline },
    divider: { marginVertical: 20, width: '100%' },
    lockedContainer: { backgroundColor: '#f4f5f7', borderRadius: 8, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0' },
    lockedRow: { marginBottom: 8 },
    lockedInfoText: { fontSize: 13, color: theme.colors.onSurfaceVariant, fontStyle: 'italic', marginTop: 12, textAlign: 'center', lineHeight: 18 },
});