// app/Authentication/index.js
import React from 'react';
import { View, StyleSheet, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AuthFormMerchant from '../../components/AuthForm'; // Import the new component

import { getAxiosClient } from '../../api/client'; // For retrying pending requests
import {
    clearPendingRequest,
    clearRedirectAfterAuth,
    // Removed setAuthenticationStatus and setPhone as AuthFormMerchant handles its UI steps
    // and sets the final 'AUTHENTICATED' status.
} from '../../store/authSlice';
// Removed store-specific clear actions as AuthFormMerchant/parent can handle if needed
// upon explicit logout trigger rather than during auth flow cancellation within the form.

const Authentication = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const styles = useStyles(insets); // Use a makeStyles function for styles

    // Selectors for post-authentication logic
    const pendingRequest = useSelector((state) => state.auth.pendingRequestConfig);
    const redirectAfterAuth = useSelector((state) => state.auth.redirectAfterAuth);
    const initialIdentifier = useSelector((state) => state.auth.phone); // Last used identifier (phone/email)
    const selectedStoreId = useSelector((state) => state.store.storeId); // Current selected store from Redux

    const handleAuthSuccess = async ({ merchant, stores /*, accessToken */ }) => {
        // This logic was previously in the useEffect reacting to 'AUTHENTICATED' status
        console.log('Merchant Authentication Successful from Authentication/index.js. Welcome,', merchant.fullName);

        if (pendingRequest) {
            console.log('Retrying pending request for merchant:');
            try {
                // const client = getAxiosClient();
                await axiosClient(pendingRequest); // Assuming pendingRequest is a full Axios request config
            } catch (err) {
                console.error('Merchant Auth: Retried request failed:', err.response ? err.response.data : err.message);
            } finally {
                dispatch(clearPendingRequest());
            }
        }

        // The SUCCESS_MESSAGE step in AuthFormMerchant shows "Welcome... Redirecting..."
        // Add a slight delay for that message to be visible before redirecting.
        setTimeout(() => {
            if (redirectAfterAuth) {
                console.log('Merchant Auth: Redirecting to designated route:', redirectAfterAuth);
                router.replace(redirectAfterAuth);
                dispatch(clearRedirectAfterAuth());
            } else {
                router.replace('/StoreSelector?exitToLogout=true'); // exitToLogout might prompt relogin if they exit selector
            }
        }, 1500); // Adjust delay as needed for the success message visibility in AuthFormMerchant
    };

    const handleCancelAuthFlowInPage = () => {
        // This is called if AuthFormMerchant's onCancelFlow prop is triggered.
        // For a full-page auth screen, this might mean navigating back or to a home/login prompt.
        // If AuthFormMerchant just resets itself, this parent page might not need to do much
        // unless it was presented modally or needs to clear other app-wide states.
        console.log("Authentication flow cancelled, handled by Authentication/index.js.");
        // Example: if there's a route they should go to on explicit cancel from deep in the flow:
        // router.replace('/'); // Or a specific public landing page
    };

    // This component now focuses on layout and passing callbacks to AuthFormMerchant.
    // No web-specific layout here as per the request to focus on mobile changes.
    // AuthFormMerchant itself has IS_WEB checks for its internal styling.

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.mobileInnerContainer}>
                    <AuthFormMerchant
                        onAuthSuccess={handleAuthSuccess}
                        onCancelFlow={handleCancelAuthFlowInPage} // Pass a handler for cancellation
                        initialIdentifierFromState={initialIdentifier}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Styles for the Authentication page itself
const useStyles = (insets) => StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
        backgroundColor: 'white', // Match AuthForm background or use a distinct page background
    },
    scrollContainer: {
        flexGrow: 1, // Important for ScrollView to allow centering content if it's short
        justifyContent: 'center', // Vertically center AuthFormMerchant if content is shorter than screen
        paddingHorizontal: 0, // AuthFormMerchant has its own padding
        paddingTop: Platform.OS === 'android' ? insets.top + 10 : insets.top + 20, // Adjust top padding for status bar
        paddingBottom: insets.bottom + 20, // Padding for home indicator/navigation bar
    },
    mobileInnerContainer: {
        alignItems: 'center', // Center AuthFormMerchant horizontally
        width: '100%',
    },
});

export default Authentication;