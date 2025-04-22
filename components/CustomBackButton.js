// components/CustomBackButton.js
import React from 'react';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Or your preferred icon library
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';

// No interface needed in JS. Props are accessed directly or destructured.
export function CustomBackButton({ style }) {
    const router = useRouter();
    // useLocalSearchParams returns the params object directly in JS
    const params = useLocalSearchParams();
    // Destructure backHref, it will be undefined if not present
    const { backHref } = params;

    const canGoBack = router.canGoBack();

    const goBack = () => {
        // Check if a specific override path is provided and is a string
        if (backHref && typeof backHref === 'string') {
            console.log(`CustomBackButton: Navigating back to specific href: ${backHref}`);
            // Use replace to avoid adding the origin screen back onto the stack
            router.replace(backHref);
        } else if (canGoBack) {
            // Otherwise, perform the default back action if possible
            console.log('CustomBackButton: Performing default router.back()');
            router.back();
        } else {
            // Optional: Fallback if no backHref and cannot go back (e.g., navigate home)
            console.log('CustomBackButton: Cannot go back and no backHref provided.');
            router.replace('/Main/(tabs)/Dashboard'); // Example: Navigate to home
        }
    };

    // Apply default styles and merge incoming style prop
    const defaultStyle = styles.button;
    const combinedStyle = StyleSheet.compose(defaultStyle, style);

    return (
        <TouchableOpacity onPress={goBack} style={combinedStyle}>
            <Ionicons
                name={'arrow-back'}
                size={24}
                color={'black'} // Use the header tint color passed by the navigator
            />
        </TouchableOpacity>
    );
}

// Optional: Add some default styling
const styles = StyleSheet.create({
    button: {
        marginLeft: 10,
        padding: 5, // Add padding for easier touch target
    },
});