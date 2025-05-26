import React, { useState } from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setNewStoreDescription } from '../../store/newStoreSlice';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";

const IS_WEB = Platform.OS === 'web';
export default function StoreDescription() {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();

    const storeDescription = useSelector((state) => state.newStore.storeDescription);
    const [description, setDescription] = useState(storeDescription || '');
    const [error, setError] = useState('');

    const handleNext = () => {
        if (!description.trim()) {
            setError('Store description is required.');
            return;
        }
        // Basic validation for description length, if desired
        if (description.trim().length < 10) {
            setError('Description should be at least 10 characters long.');
            return;
        }
        if (description.trim().length > 500) { // Example max length
            setError('Description is too long (max 500 characters).');
            return;
        }

        setError(''); // Clear error if validation passes
        dispatch(setNewStoreDescription(description.trim()));
        router.push(IS_WEB ? '/create_store/store_logo' : '/CreateStore/StoreLogo');
    };

    const commonWrapperStyle = { flex: 1, backgroundColor: 'white' };

    const screenContent = (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, justifyContent: 'center', width: '100%' /* Ensures inner view uses container width */ }}>
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleLarge" style={styles.heading}>Describe Your Store</Text>
                <Text variant="bodyMedium" style={styles.subheading}>
                    Tell your customers what your store is all about in a few words. This helps them understand your product offerings.
                </Text>
                <TextInput
                    label="Store Description (e.g., We sell unique handmade crafts)"
                    value={description}
                    onChangeText={(text) => {
                        setDescription(text);
                        if (error) setError(''); // Clear error when user types
                    }}
                    mode="outlined"
                    multiline
                    numberOfLines={4} // Slightly more lines for better multiline UX
                    style={styles.input}
                    error={!!error}
                    maxLength={500} // Corresponds to validation
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : <View style={{minHeight: 20, marginBottom: 16}} /> /* Placeholder for error to prevent jump */}


                <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center', marginTop: 16 /* Adjusted margin */}}>
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        style={styles.button}
                        // contentStyle={{paddingVertical: 4}} // Add some padding inside button
                    >
                        Next
                    </Button>
                </View>
            </View>
        </ScrollView>
    );

    if (Platform.OS === 'web') {
        return (
            <View style={commonWrapperStyle}>
                {screenContent}
            </View>
        );
    } else {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={commonWrapperStyle}
            >
                {screenContent}
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: 'white',
        // Web-specific styles
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 600, // Max width for the content on web
            alignSelf: 'center',
        }),
    },
    heading: {
        marginBottom: 8, // Adjusted margin
        textAlign: 'center', // Center heading text
    },
    subheading: {
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 10,
        color: 'grey',
    },
    input: {
        marginBottom: 0, // Error text will provide bottom margin
        backgroundColor: 'white',
        minHeight: 120, // Adjusted minHeight for 4 lines
    },
    errorText: {
        color: 'red', // Use theme.colors.error from useTheme() for consistency
        marginTop: 4, // Space above error text
        marginBottom: 16, // Space below error text
        textAlign: 'center',
        minHeight: 20, // Reserve space to prevent layout jumps
    },
    button: {
        borderRadius: 8,
        // width: '90%', // Make button wider
        maxWidth: 300, // Max width for the button itself
    },
});