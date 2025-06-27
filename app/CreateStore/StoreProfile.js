import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Menu, Divider, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName"; // Adjust path as needed
import { setNewStoreField } from "../../store/newStoreSlice"; // Adjust path as needed
import PhoneInput from "../../components/PhoneInput";
import {formatPhone} from "../../utils/identifierUtils"; // Adjust path as needed

const IS_WEB = Platform.OS === 'web';


export default function StoreProfile() {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();
    const styles = makeStyles(theme);
    const newStoreState = useSelector((state) => state.newStore);

    const [storeEmail, setStoreEmail] = useState(newStoreState.storeEmail || '');
    const [storePhone, setStorePhone] = useState(newStoreState.storePhone || '');

    const [errors, setErrors] = useState({});


    const validate = () => {
        const newErrors = {};
        if (!storeEmail.trim()) {
            newErrors.storeEmail = "Store email is required.";
        } else if (!/\S+@\S+\.\S+/.test(storeEmail)) {
            newErrors.storeEmail = "Email address is invalid.";
        }
        if (!storePhone.trim()) {
            newErrors.storePhone = "Store phone is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleNext = () => {
        if (validate()) {
            dispatch(setNewStoreField({ field: 'storeEmail', value: storeEmail.trim() }));
            dispatch(setNewStoreField({ field: 'storePhone', value: formatPhone(storePhone.trim()) }));

            router.push(IS_WEB ? '/create_store/store_tags' : '/CreateStore/StoreTags');
        } else {
            Alert.alert("Validation Error", "Please fill all required fields correctly.");
        }
    };

    const commonWrapperStyle = { flex: 1, backgroundColor: 'white' };

    const screenContent = (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleMedium" style={styles.sectionTitle}>Business & Contact Details</Text>

                <TextInput
                    label="Business Email"
                    value={storeEmail}
                    onChangeText={setStoreEmail}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!!errors.storeEmail}
                />
                {Boolean(errors.storeEmail) && <HelperText type="error">{errors.storeEmail}</HelperText>}

                <PhoneInput label={"Business Phone Number"} setPhone={setStorePhone} style={styles.input} error={!!errors.storePhone}/>
                {Boolean(errors.storePhone) && <HelperText type="error">{errors.storePhone}</HelperText>}

                <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center', marginTop: 32 }}>
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        style={styles.button}
                    >
                        Next
                    </Button>
                </View>
            </View>
        </ScrollView>
    );

    if (Platform.OS === 'web') {
        return <View style={commonWrapperStyle}>{screenContent}</View>;
    } else {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={commonWrapperStyle}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {screenContent}
            </KeyboardAvoidingView>
        );
    }
}

const makeStyles = (theme) => StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: 'white',
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 700,
            alignSelf: 'center',
        }),
    },
    input: {
        marginBottom: 8,
        backgroundColor: 'white',
    },
    button: {
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        marginTop: 20,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    dropdownGroupTitle: {
        marginTop: 16,
        marginBottom: 8,
        // textAlign: 'center',
        color: theme.colors.onSurfaceVariant, // Or your preferred color
    },
    divider: {
        marginVertical: 25,
        height: 1.5,
    },
    dropdownAnchor: {
        backgroundColor: 'white',
        marginTop: 8,
        marginBottom: 12, // For consistency with TextInput + HelperText
        height: 56,
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderWidth: 1,
        borderRadius: 4,
    },
    dropdownLabel: {
        // Styles for the text inside the dropdown anchor button
    },
    menuStyle: {
        // marginTop: 60, // Adjust if menu is not aligned with anchor
    },
    addressFormContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: Platform.OS === 'web' ? 20 : 15,
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: '#f9f9f9'
    },
    noSubCategoryText: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        color: theme.colors.onSurfaceVariant,
        fontStyle: 'italic',
        marginBottom: 8,
    }
});