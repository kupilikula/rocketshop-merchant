import React, { useState } from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper'; // TextInput, Text are imported but not directly used in this screen's JSX
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";

import GstSettingsComponent from "../../components/GstSettingsComponent";
import {setNewStoreSettings} from "../../store/newStoreSlice";

const IS_WEB = Platform.OS === 'web';
// The component is named StoreDescription, though its content focuses on GST settings.
export default function StoreDescription() {
    const theme = useTheme(); // Used implicitly by Paper components
    const router = useRouter();
    const dispatch = useDispatch();

    const storeSettings = useSelector((state) => state.newStore.storeSettings);
    // Initialize local state with values from Redux or defaults
    const [gstRate, setGstRate] = useState(storeSettings?.defaultGstRate ?? 0); // Use ?? for clearer null/undefined check
    const [gstInclusive, setGstInclusive] = useState(storeSettings?.defaultGstInclusive ?? false); // Use ??

    const handleNext = () => {
        dispatch(setNewStoreSettings({defaultGstRate: gstRate, defaultGstInclusive: gstInclusive}));
        router.push(IS_WEB ? '/create_store/store_summary' : '/CreateStore/StoreSummary');
    };

    const commonWrapperStyle = { flex: 1, backgroundColor: 'white' };

    const screenContent = (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, justifyContent: 'center' }}> {/* Inner centering view */}
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <GstSettingsComponent
                    rate={gstRate}
                    setRate={setGstRate}
                    inclusive={gstInclusive}
                    setInclusive={setGstInclusive}
                />
                <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center', marginTop: 32 /* Added consistent margin for button */ }}>
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
        padding: 20, // Padding for content on both mobile and web
        justifyContent: 'center', // Centers content vertically
        backgroundColor: 'white', // Background for the scrollable content area
        // Web-specific styles for a centered, max-width layout
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 600, // Max width for the settings content on web (adjust as needed)
            alignSelf: 'center',
        }),
    },
    // heading and input styles are defined as per original, though not directly used in this screen's JSX
    heading: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
        minHeight: 100,
    },
    button: {
        borderRadius: 8,
        paddingHorizontal: 16, // Give button a bit more horizontal padding
    },
});