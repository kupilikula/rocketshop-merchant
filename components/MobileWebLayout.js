import React from 'react';
import { Stack, usePathname } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import InstallAppScreen from './InstallAppScreen';

// The single route allowed for mobile web users
const ALLOWED_MOBILE_WEB_PATH = '/(web_merchant)/billing';

export default function MobileWebLayout({ theme }) {
    const pathname = usePathname();

    // Check if the current URL path starts with the allowed path
    const isPathAllowed = pathname.startsWith(ALLOWED_MOBILE_WEB_PATH);

    if (isPathAllowed) {
        // If the path is allowed, render the standard Expo Router Stack.
        // Expo Router will automatically handle rendering the correct file from your app directory.
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <PaperProvider theme={theme}>
                    <Stack screenOptions={{ headerShown: false }} />
                </PaperProvider>
            </GestureHandlerRootView>
        );
    }

    // If the path is NOT allowed, render the install screen.
    return <InstallAppScreen theme={theme} />;
}