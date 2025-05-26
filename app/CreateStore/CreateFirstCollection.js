import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { setNewStoreFirstCollectionName } from '../../store/newStoreSlice';
import LogoIconWithName from "../../components/LogoIconWithName";

const IS_WEB = Platform.OS === 'web';

export default function CreateFirstCollection() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();

    const [collectionName, setCollectionName] = useState('Featured'); // Default name
    const [error, setError] = useState(null);

    const handleNext = () => {
        const trimmedName = collectionName.trim();
        if (!trimmedName) {
            setError('Collection name is required.');
            return;
        }
        // Optional: Add more validation for collection name (e.g., length)
        if (trimmedName.length > 50) {
            setError('Collection name is too long (max 50 characters).');
            return;
        }

        setError(null); // Clear error if validation passes
        dispatch(setNewStoreFirstCollectionName(trimmedName));
        router.push(IS_WEB ? '/create_store/store_settings' : '/CreateStore/StoreSettings'); // Ensure this is the correct next route
    };

    const commonWrapperStyle = { flex: 1, backgroundColor: 'white' };

    const screenContent = (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, justifyContent: 'center', width: '100%' /* Ensures inner view uses container width */ }}>
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleLarge" style={styles.heading}>
                    Create Your First Collection
                </Text>
                <Text variant="bodyMedium" style={styles.subheading}>
                    Collections help you organize your products. You can change this later.
                </Text>

                <TextInput
                    label="Collection Name (e.g., Featured, Summer Sale)"
                    mode="outlined"
                    value={collectionName}
                    onChangeText={(text) => {
                        setCollectionName(text);
                        if (error) setError(null); // Clear error when user types
                    }}
                    style={styles.input}
                    error={!!error}
                    maxLength={50} // Corresponds to validation
                />

                {error && <Text style={styles.errorText}>{error}</Text>}
                {/* Placeholder for error to prevent layout jump when no error */}
                {!error && <View style={{ minHeight: 20, marginBottom: 16 }} />}


                <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center', marginTop: error ? 0 : 8 /* Adjust margin based on error visibility */}}>
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
        justifyContent: 'center',
        padding: 20, // Changed from 16 for a bit more space, revert if 16 is strict
        backgroundColor: 'white',
        // Web-specific styles
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 500, // Max width for the form content on web
            alignSelf: 'center',
        }),
    },
    heading: {
        marginBottom: 8,
        textAlign: 'center',
    },
    subheading: {
        marginBottom: 24,
        textAlign: 'center',
        paddingHorizontal: 10,
        color: 'grey',
    },
    input: {
        marginBottom: 8, // Error text will provide further spacing if it appears
        backgroundColor: 'white',
    },
    errorText: {
        color: 'red', // Consider using theme.colors.error
        marginBottom: 16,
        textAlign: 'center',
        minHeight: 20, // To prevent layout jumps
    },
    button: {
        borderRadius: 8,
        // marginTop: 8, // Original marginTop, now handled by wrapper view conditionally
        // width: '90%',
        maxWidth: 300,
    },
});