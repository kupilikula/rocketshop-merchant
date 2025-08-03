import React from 'react';
import { Stack, usePathname } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import InstallAppScreen from './InstallAppScreen';
import {QueryClient, QueryClientProvider} from "react-query";
import {Provider} from "react-redux";
import {persistor, store} from "@/store/store";
import {PersistGate} from "redux-persist/integration/react";

// The single route allowed for mobile web users
const ALLOWED_MOBILE_WEB_PATH = '/billing';

const queryClient = new QueryClient();

export default function MobileWebLayout({ theme }) {
    const pathname = usePathname();
    console.log('pathname:',pathname);
    // Check if the current URL path starts with the allowed path
    const isPathAllowed = pathname.startsWith(ALLOWED_MOBILE_WEB_PATH);

    if (isPathAllowed) {
        console.log('path allowed');
        // If the path is allowed, render the standard Expo Router Stack.
        // Expo Router will automatically handle rendering the correct file from your app directory.
        return (
            <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                <PaperProvider theme={theme}>
                    <Stack screenOptions={{ headerShown: false }} />
                </PaperProvider>
                    </PersistGate>
                </Provider>
            </GestureHandlerRootView>
            </QueryClientProvider>
        );
    }
    console.log('path not allowed');

    // If the path is NOT allowed, render the install screen.
    return <InstallAppScreen theme={theme} />;
}