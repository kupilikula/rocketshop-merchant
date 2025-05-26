// components/CustomBackButton.js
import React from 'react';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Or your preferred icon library
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import { useNavigationContainerRef } from 'expo-router';
import {getDashboardPath} from "@/utils/getPathUtils";

// No interface needed in JS. Props are accessed directly or destructured.
export function CustomBackButton({ style }) {
    const router = useRouter();
    // useLocalSearchParams returns the params object directly in JS
    const params = useLocalSearchParams();
    const navRef = useNavigationContainerRef();

    // Destructure backHref, it will be undefined if not present
    const { backHref } = params;

    const canGoBack = router.canGoBack();

    const goBack = () => {

        // router.back();
        // console.log('NAVIGATION STACK BEFORE GOING BACK', JSON.stringify(navRef.getRootState(), null, 4));
        // if (backHref && typeof backHref === 'string') {
        //     console.log(`CustomBackButton: Navigating back to specific href: ${backHref}`);
        //     router.push(backHref);
        //     router.setParams({backHref: undefined});
        //
        // } else
        if (canGoBack) {
            console.log('CustomBackButton: Performing default router.back()');
            router.back();
        } else {
            console.log('CustomBackButton: Cannot go back and no backHref provided.');
            router.push(getDashboardPath());
        }
        // console.log('NAVIGATION STACK AFTER GOING BACK', JSON.stringify(navRef.getRootState(), null, 4));
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