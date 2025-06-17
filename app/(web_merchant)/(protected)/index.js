// app/index.js
import React from 'react';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { Platform, View, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function IndexPage() {
    const authStatus = useSelector((state) => state.auth.authenticationStatus);
    const theme = useTheme();

    // Once authentication status is resolved:
    if (Platform.OS === 'web') {
        console.log("IndexPage (Web): Auth status resolved, redirecting to web_merchant home.");
        if (authStatus === 'AUTHENTICATED') {
            console.log("IndexPage (Web): Authenticated, redirecting to Dashboard.");
            return <Redirect href="/(web_merchant)/(protected)/dashboard" />;
        } else {
            console.log("IndexPage (web): Not authenticated, redirecting to Authentication screen.");
            return <Redirect href="/(web_merchant)/landing_page" />; // This renders app/(web_marketplace)/index.js
        }

    } else {
        // Mobile specific logic
        if (authStatus === 'AUTHENTICATED') {
            console.log("IndexPage (Mobile): Authenticated, redirecting to Main feed.");
            return <Redirect href="/Main/(tabs)/Dashboard" />;
        } else {
            console.log("IndexPage (Mobile): Not authenticated, redirecting to Authentication screen.");
            return <Redirect href="/Authentication/" />;
        }
    }
}
