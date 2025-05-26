// components/AuthModal.js
import React, {useCallback, useEffect, useMemo} from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Portal, Modal as PaperModal, useTheme, ActivityIndicator, Text } from 'react-native-paper'; // Added Text for potential error display
import { useSelector, useDispatch } from 'react-redux';
import {
    closeAuthModal,
    clearPendingRequest,
    clearRedirectAfterAuth
} from '../store/authSlice'; // Adjust path as per your project structure
import AuthForm from './AuthForm'; // Adjust path
import { getAxiosClient } from '../api/client'; // Adjust path
import { useRouter } from 'expo-router';
import {getStoreSelectorPath} from "../utils/getPathUtils";
// import {getHomePath} from "../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web';

const AuthModal = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const router = useRouter();

    const isVisible = useSelector((state) => state.auth.isAuthModalVisible);
    const phoneFromState = useSelector((state) => state.auth.phone);

    // For fallback handling if not managed by authContinuation.onSuccess
    const pendingRequest = useSelector((state) => state.auth.pendingRequestConfig);
    const redirectPathAfterAuth = useSelector((state) => state.auth.redirectAfterAuth);

    const styles = useMemo(() => makeStyles(theme, IS_WEB), [theme]);

    const handleDismiss = useCallback(() => {
        // Call onCancel from continuation if it exists
        dispatch(closeAuthModal()); // Close modal and clear continuation from Redux
        if (redirectPathAfterAuth) {
            router.back()
        } // If auth modal was triggered by a protected route, navigate back on dismiss
    }, [dispatch, router, redirectPathAfterAuth]);

    const handleAuthSuccess = useCallback(async (/* authData from AuthForm: { customer, accessToken, cartData } */) => {
        // AuthForm itself will have dispatched setCustomer and set the global authenticationStatus to 'AUTHENTICATED'.
        // Now, AuthModal's job is to orchestrate what happens next.

            // 4. Fallback: Handle old pendingRequest and redirectAfterAuth if no specific onSuccess
            let actionTaken = false;
            if (pendingRequest) {
                console.log('AuthModal: Retrying pending request (fallback)...');
                actionTaken = true;
                try {
                    const client = getAxiosClient();
                    // Assuming pendingRequest is the actual Axios request config
                    await client(pendingRequest); // Or pendingRequest.config if that's how you store it
                } catch (err) {
                    console.error('AuthModal: Retried request failed (fallback):', err);
                } finally {
                    dispatch(clearPendingRequest());
                }
            }

            if (redirectPathAfterAuth) {
                console.log('AuthModal: Redirecting to (fallback):', redirectPathAfterAuth);
                actionTaken = true;
                if (router) router.replace(redirectPathAfterAuth);
                dispatch(clearRedirectAfterAuth());
            }

            setTimeout(() => {
                dispatch(closeAuthModal());
                console.log('actionTaken', actionTaken);
                if (!actionTaken) {
                    router.replace(getStoreSelectorPath() + '?exitToLogout=true');
                }

            }, 1500);
    }, [dispatch, router, pendingRequest, redirectPathAfterAuth]); // authContinuation here ensures we use its value at the time of success

    if (!isVisible) {
        return null; // Don't render anything if not visible
    }

    return (
        <Portal>
            <PaperModal
                visible={isVisible}
                onDismiss={handleDismiss} // Handles backdrop click, Esc key
                contentContainerStyle={styles.modalContentContainer}
                style={styles.modalOverlayStyle} // For centering or backdrop styling if needed beyond default
                dismissable={true} // Allow dismissal by clicking backdrop/Esc
                // Set to false if only an explicit button in AuthForm should close it.
            >
                {/* ScrollView is important if AuthForm content can exceed modal's maxHeight */}
                <ScrollView
                    style={styles.scrollViewStyle}
                    contentContainerStyle={styles.scrollViewInternalContentContainer}
                    keyboardShouldPersistTaps="handled" // Good for forms
                    showsVerticalScrollIndicator={false}
                >
                    <AuthForm
                        onAuthSuccess={handleAuthSuccess}
                        // Pass onCancel if AuthForm has its own "Cancel" button
                        // onCancel={handleDismiss}
                        initialPhoneFromState={phoneFromState}
                    />
                </ScrollView>
            </PaperModal>
        </Portal>
    );
};

const makeStyles = (theme, isWeb) => StyleSheet.create({
    modalOverlayStyle: { // Optional: For styling the Modal component itself (e.g. to ensure centering if needed)
        // PaperModal usually centers itself. This can be used for custom backdrop if Portal doesn't cover it.
        // alignItems: 'center', // Ensure modal itself is centered if it doesn't take full screen
        // justifyContent: 'center',
    },
    modalContentContainer: { // Styles the "card" or visible content area of the Modal
        backgroundColor: theme.colors.surface,
        borderRadius: isWeb ? 12 : 20, // More rounded for mobile if it were a native modal
        width: 'auto', // Let content + padding define width up to maxWidth
        minWidth: isWeb ? 340 : '90%',
        maxWidth: isWeb ? 480 : '90%',
        maxHeight: isWeb ? '90vh' : '85vh', // Ensure it fits on screen, content will scroll
        alignSelf: 'center', // Center the modal "card" on the screen
        elevation: isWeb ? 8 : 5, // Shadow for the modal
        overflow: 'hidden', // Crucial to make ScrollView respect modal bounds and maxHeight
    },
    scrollViewStyle: { // Style for the ScrollView component *inside* the modal's content container
        // This ScrollView does not need flex: 1 as its height is constrained by modalContentContainer.maxHeight
    },
    scrollViewInternalContentContainer: { // For padding *within* the ScrollView, around AuthForm
        paddingVertical: IS_WEB ? 0 : 8, // AuthForm itself has padding, so this can be minimal or 0
        paddingHorizontal: IS_WEB ? 0 : 4, // Minimal horizontal padding if AuthForm handles most of it
        flexGrow: 1, // Important for ScrollView to allow content to determine scroll height
    },
});

export default AuthModal;