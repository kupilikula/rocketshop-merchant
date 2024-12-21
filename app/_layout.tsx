import {Stack} from "expo-router";
import {PaperProvider} from "react-native-paper";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Platform, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {useEffect} from "react";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {DefaultTheme} from 'react-native-paper';
import {Provider} from "react-redux";
import {store} from "@/store/store";
import * as NavigationBar from 'expo-navigation-bar';

const isLoggedIn = true;
export default function RootLayout() {

    const customTheme = {
        ...DefaultTheme, colors: {
            ...DefaultTheme.colors, primary: '#3A86FF', // Royal Blue
            secondary: '#FF6F59', // Sunset Orange
            background: '#F4F4F9', // Soft Gray
            surface: '#FFFFFF', // White
            text: '#2B2D42', // Almost Black
            placeholder: '#8D99AE', // Medium Gray
            disabled: '#E0E0E0', // Light Gray for disabled elements
            error: '#D72638', // Bright Red
            success: '#37A745', // Emerald Green
            warning: '#FFBE0B', // Gold
            icon: '#4361EE', // Steel Blue for icons
            info: '#00C4CC', // Turquoise Blue for informational states
        }, dark: false, // Set to true if creating a dark theme
    };

    useEffect(() => {
        // Make navigation bar transparent
        if (Platform.OS==='android') {
            NavigationBar.setBackgroundColorAsync('transparent');
        }
    }, []);

    return (

        <SafeAreaProvider>
            <GestureHandlerRootView style={{flex: 1}}>
                <Provider store={store}>
                    <PaperProvider theme={customTheme}>
                            <StatusBar style="dark"/>
                            <Stack screenOptions={{header: () => null}}/>
                    </PaperProvider>
                </Provider>
            </GestureHandlerRootView>
        </SafeAreaProvider>);
}
