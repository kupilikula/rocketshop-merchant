import React, { useState } from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {Text, TextInput, Button, useTheme, Checkbox} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setNewStoreName, setIsPlatformOwned as setNewStoreIsPlatformOwned } from '../../store/newStoreSlice';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";
import {getCreateStorePath} from "../../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web';

export default function StoreNameScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();

    const storeName = useSelector((state) => state.newStore.storeName);
    const [localStoreName, setLocalStoreName] = useState(storeName);
    const [isPlatformOwned, setIsPlatformOwned] = useState(false);
    const {isPlatformMerchant} = useSelector((state) => state.merchant);
    // const [error, setError] = useState('');

    const handleNext = () => {
        if (!localStoreName.trim()) {
            // setError('Store name is required');
            return;
        }
        dispatch(setNewStoreName(localStoreName.trim()));
        dispatch(setNewStoreIsPlatformOwned(isPlatformOwned));
        router.push(getCreateStorePath() + (IS_WEB ? '/store_handle' : '/StoreHandle')); // Move to next step
    };

    // Common style for the outermost wrapper on all platforms
    const commonWrapperStyle = { flex: 1, backgroundColor: 'white' };

    // The content (ScrollView and its children) is the same for all platforms
    const screenContent = (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleLarge" style={styles.heading}>
                    Enter Store Name
                </Text>
                <TextInput
                    label="Store Name"
                    mode="outlined"
                    // value={localStoreName}
                    onChangeText={(text) => {
                        setLocalStoreName(text);
                        // if (error) setError('');
                    }}
                    style={styles.input}
                    // error={!!error}
                />
                {isPlatformMerchant &&
                    <View style={styles.checkboxContainer}>
                        <Checkbox.Android
                            status={isPlatformOwned ? 'checked' : 'unchecked'}
                            onPress={() => setIsPlatformOwned(!isPlatformOwned)}
                        />
                        <Text style={styles.checkboxLabel}>
                            Is this a RocketShop Platform Owned Store?
                        </Text>
                    </View>}

                <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center'}}>
                    <Button mode="contained" onPress={handleNext} style={{ borderRadius: 8 }}>
                        Next
                    </Button>
                </View>
            </View>
        </ScrollView>
    );

    if (Platform.OS === 'web') {
        // On web, use a simple View as the main container
        return (
            <View style={commonWrapperStyle}>
                {screenContent}
            </View>
        );
    } else {
        // On mobile (iOS, Android), use KeyboardAvoidingView
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Specific behavior for iOS
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
        // Web-specific styles for a centered, max-width layout
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 500, // Max width for the form content on web
            alignSelf: 'center',
        }),
    },
    heading: {
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkboxLabel: {
        // marginLeft: 8, // As per original
    },
});