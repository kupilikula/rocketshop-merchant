// app/settings/subscription.js

import React from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator, SafeAreaView, Platform} from 'react-native';
import { useSelector } from 'react-redux';
import * as Linking from 'expo-linking';
import { useSubscriptionStatus } from '../../../../api/hooks/useSubscriptionStatus';
import {getAxiosClient} from "../../../../api/client";
import {useRouter} from "expo-router"; // Adjust path

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
    } catch (e) { return 'Invalid Date'; }
};

const IS_WEB = Platform.OS === 'web';

export default function SubscriptionScreen() {
    const axiosClient = getAxiosClient();
    const router = useRouter();
    const { storeId } = useSelector((state) => state.store);
    const { data: statusData, isLoading, isError, error } = useSubscriptionStatus(storeId);

    const handleManage = async () => {

        let token = null;
        if (!IS_WEB) {
            const {data} = await axiosClient.post('/auth/autoLogin/generate');
            token = data.token;
        }

        let billingUrl;

        if (IS_WEB) {
            router.replace('/(web_merchant)/billing')
        } else {
            const subdomain = process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'subscription' : 'subscription.qa';
            billingUrl = `https://${subdomain}.rocketshop.in/billing?storeId=${storeId}&token=${token}`;
        }

        Linking.openURL(billingUrl);
    };

    const renderContent = () => {
        if (isLoading) return <ActivityIndicator size="large" color="#007AFF" />;
        if (isError) return <Text style={styles.errorText}>Error: {error.message}</Text>;

        const subscriptions = statusData?.subscriptions || [];
        let displaySubscription = subscriptions.find(s => s.subscriptionStatus === 'active') ||
            subscriptions.find(s => s.subscriptionStatus === 'authenticated') ||
            subscriptions.find(s => s.subscriptionStatus === 'cancelled');

        return (
            <>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Plan</Text>
                    <Text style={styles.value}>{displaySubscription?.planName || 'N/A'}</Text>
                </View>
                {(() => {
                    switch (displaySubscription?.subscriptionStatus) {
                        case 'active':
                            return <>
                                <View style={styles.infoRow}><Text style={styles.label}>Status</Text><Text style={[styles.value, styles.activeText]}>Active</Text></View>
                                <View style={styles.infoRow}><Text style={styles.label}>Renews On</Text><Text style={styles.value}>{formatDate(displaySubscription.periodEnd)}</Text></View>
                            </>;
                        case 'authenticated':
                            return <>
                                <View style={styles.infoRow}><Text style={styles.label}>Status</Text><Text style={[styles.value, styles.infoText]}>Scheduled</Text></View>
                                <View style={styles.infoRow}><Text style={styles.label}>Starts On</Text><Text style={styles.value}>{formatDate(displaySubscription.periodStart)}</Text></View>
                            </>;
                        case 'cancelled':
                            return <>
                                <View style={styles.infoRow}><Text style={styles.label}>Status</Text><Text style={[styles.value, styles.warningText]}>Active (Won't Renew)</Text></View>
                                <View style={styles.infoRow}><Text style={styles.label}>Expires On</Text><Text style={styles.value}>{formatDate(displaySubscription.periodEnd)}</Text></View>
                            </>;
                        default:
                            return <>
                                <View style={styles.infoRow}><Text style={styles.label}>Status</Text><Text style={[styles.value, styles.errorText]}>Inactive</Text></View>
                                <Text style={styles.inactiveText}>An active subscription is required for your store to be visible.</Text>
                            </>;
                    }
                })()}
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                {IS_WEB && <Text style={styles.header}>My Subscription</Text>}
                {renderContent()}
                <Pressable style={styles.button} onPress={handleManage}>
                    <Text style={styles.buttonText}>Manage</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f5f7', padding: 16, },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#1c1c1e', },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderColor: '#eef0f3', },
    label: { fontSize: 16, color: '#6e6e73', marginRight: 10 },
    value: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1c1c1e', textAlign: 'right' },
    inactiveText: { fontSize: 14, color: '#6e6e73', textAlign: 'center', marginTop: 24, lineHeight: 20, },
    button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 10, marginTop: 32, alignItems: 'center', },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
    errorText: { color: '#dc3545', fontWeight: '600' },
    activeText: { color: '#28a745', fontWeight: '600' },
    warningText: { color: '#fd7e14', fontWeight: 'bold' },
    infoText: { color: '#007AFF', fontWeight: 'bold' },
});