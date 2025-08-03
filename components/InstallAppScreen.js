import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Image } from 'react-native';
import { PaperProvider, useTheme } from 'react-native-paper'; // Use PaperProvider for theme consistency

// Replace with your actual app store URLs and logo
const APP_STORE_URL = 'https://apps.apple.com/us/app/your-app-name/idYOUR_APP_ID';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.your.package.name';
const AppLogo = require('../assets/images/RocketShopIconOrange1024.png'); // Make sure you have an icon at this path

function InstallAppContent() {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <Image source={AppLogo} style={styles.logo} />
            <Text style={[styles.title, { color: theme.colors.text }]}>Get the RocketSbop Merchant App</Text>
            <Text style={styles.subtitle}>
                To manage your store, please install our secure mobile app.
            </Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={() => Linking.openURL(APP_STORE_URL)}>
                <Text style={styles.buttonText}>Download on the App Store</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={() => Linking.openURL(GOOGLE_PLAY_URL)}>
                <Text style={styles.buttonText}>Get it on Google Play</Text>
            </TouchableOpacity>
        </View>
    );
}

// Wrap with PaperProvider to use the theme from your RootLayout
export default function InstallAppScreen({ theme }) {
    return (
        <PaperProvider theme={theme}>
            <InstallAppContent />
        </PaperProvider>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 300,
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginVertical: 10,
        width: '90%',
        maxWidth: 320,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});