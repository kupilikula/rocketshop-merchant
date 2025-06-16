// app/settings/subscription.js (or your preferred path)

import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import * as Linking from 'expo-linking';
import { useSubscriptionStatus } from '../../../../api/hooks/useSubscriptionStatus'; // Adjust path to your hooks

// Helper to format dates nicely
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // As of June 17, 2025
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export default function SubscriptionScreen() {
    const { storeId } = useSelector((state) => state.store);

    // This is the only query hook needed. We don't need mutation hooks here.
    const {
        data: subscription,
        isLoading,
        isError,
        error
    } = useSubscriptionStatus(storeId);

    const handleManageOnWeb = () => {
        // This is the single, most important action on this screen.
        // It sends the user to the web portal where they can take action.
        const subdomain = process.env.APP_ENV==='production' ? 'subscription' : 'subscription.qa';
        const billingUrl = `https://${subdomain}.rocketshop.in/billing`;

        // For a seamless UX, you could generate a short-lived auth token on your backend
        // and append it to the URL, e.g., `${billingUrl}?token=...`
        // so your web app can automatically log the user in.
        Linking.openURL(billingUrl);
    };

    const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#3A86FF" />;
        }

        if (isError) {
            return <Text style={styles.errorText}>Error: {error.message}</Text>;
        }

        return (
            <>
                {subscription?.isActive ? (
                    // --- VIEW FOR SUBSCRIBED USERS ---
                    <>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Current Plan</Text>
                            <Text style={styles.value}>{subscription.planName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Status</Text>
                            <Text style={[styles.value, { color: '#28a745' }]}>Active</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Renews On</Text>
                            <Text style={styles.value}>{formatDate(subscription.renewsOn)}</Text>
                        </View>
                    </>
                ) : (
                    // --- VIEW FOR NEW/UNSUBSCRIBED USERS ---
                    <>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Status</Text>
                            <Text style={[styles.value, { color: '#dc3545' }]}>Inactive</Text>
                        </View>
                        <Text style={styles.inactiveText}>
                            An active subscription is required to make your store visible to customers.
                        </Text>
                    </>
                )}
                <Pressable style={styles.button} onPress={handleManageOnWeb}>
                    <Text style={styles.buttonText}>Manage Subscription</Text>
                </Pressable>
            </>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.header}>My Subscription</Text>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f5f7',
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#1c1c1e',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: '#eef0f3',
    },
    label: {
        fontSize: 16,
        color: '#6e6e73',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1c1c1e',
    },
    inactiveText: {
        fontSize: 14,
        color: '#6e6e73',
        textAlign: 'center',
        marginTop: 24,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#007AFF', // A more standard iOS blue
        padding: 16,
        borderRadius: 10,
        marginTop: 32,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#dc3545',
        textAlign: 'center',
    }
});