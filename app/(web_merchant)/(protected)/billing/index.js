import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import {useSelector} from "react-redux";
import {useSubscriptionStatus} from "../../../../api/hooks/useSubscriptionStatus";
import {useCreateSubscription} from "../../../../api/hooks/useCreateSubscription";
import {useCancelSubscription} from "../../../../api/hooks/useCancelSubscription";
// import { useAuth } from '../context/AuthContext'; // Assuming you have an Auth context to get user/store info

export default function BillingPage() {
    const [loading, setLoading] = useState(true);
    const { storeId } = useSelector((state) => state.store);
    const {
        data: subscription,
        isLoading,
        isError,
        error
    } = useSubscriptionStatus(storeId);

    // Initialize the mutation
    const { mutate: createSubscription, isLoading: isSubscribing } = useCreateSubscription({
        onSuccess: (data) => {
            // This is the most important part. On success, redirect to Razorpay.
            if (data.subscription_url) {
                window.location.href = data.subscription_url;
            } else {
                alert("Error: Could not retrieve payment link.");
            }
        },
        onError: (error) => {
            // Handle any errors from your backend API call
            alert(`Error: ${error.response?.data?.message || error.message}`);
        },
    });

    const { mutate: cancelSubscription, isLoading: isCancelling } = useCancelSubscription({
        onSuccess: () => {
            alert("Success", "Your subscription has been cancelled and will not renew.");
        },
        onError: (error) => {
            alert(`Error: ${error.response?.data?.message || error.message}`);
        },
    });

    const handleSubscribe = (planType) => {
        if (!storeId) {
            return;
        }
        // Call the mutation with the necessary variables
        createSubscription({ planType, storeId});
    };

    const handleCancel = () => {
        // Add a confirmation dialog before calling the mutation
        if (window.confirm("Are you sure? Your subscription will be cancelled at the end of the current period.")) {
            cancelSubscription(storeId);
        }
    };

    if (loading) {
        return <View style={styles.container}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Subscription Management</Text>

            {subscription?.isActive ? (
                // --- VIEW FOR SUBSCRIBED USERS ---
                <View style={styles.card}>
                    <Text style={styles.subHeader}>Your Current Plan</Text>
                    <Text style={styles.planName}>{subscription.planName}</Text>
                    <Text style={styles.text}>Status: <Text style={styles.activeText}>Active</Text></Text>
                    <Text style={styles.text}>Renews on: {subscription.renewsOn}</Text>
                    <Pressable style={styles.buttonSecondary} disabled={isCancelling} onPress={handleCancel}>
                        <Text style={styles.buttonTextSecondary}>{isCancelling ? 'Processing...' : 'Cancel Subscription'}</Text>
                    </Pressable>
                </View>
            ) : (
                // --- VIEW FOR NEW/UNSUBSCRIBED USERS ---
                <View>
                    <Text style={styles.subHeader}>Choose a Plan to Activate Your Store</Text>
                    <View style={styles.planContainer}>
                        {/* Monthly Plan */}
                        <View style={styles.card}>
                            <Text style={styles.planName}>Monthly Plan</Text>
                            <Text style={styles.price}>₹2,000 <Text style={styles.pricePer}>/ month</Text></Text>
                            <Text style={styles.text}>Flexibility to pay month-to-month.</Text>
                            <Pressable style={styles.button} onPress={() => handleSubscribe('monthly')}>
                                <Text style={styles.buttonText}>{isSubscribing ? 'Processing...' : 'Subscribe Now'}</Text>
                            </Pressable>
                        </View>

                        {/* Annual Plan */}
                        <View style={styles.card}>
                            <Text style={styles.planName}>Annual Plan</Text>
                            <Text style={styles.price}>₹22,000 <Text style={styles.pricePer}>/ year</Text></Text>
                            <Text style={styles.text}>Save money with an annual commitment.</Text>
                            <Pressable style={styles.button} onPress={() => handleSubscribe('annual')}>
                                <Text style={styles.buttonText}>{isSubscribing ? 'Processing...' : 'Subscribe Now'}</Text>
                            </Pressable>
                        </View>
                    </View>
                    {isSubscribing && <ActivityIndicator size="large" style={{ marginTop: 20 }}/>}
                </View>
            )}
        </View>
    );
}

// Basic styling for web layout
const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    subHeader: { fontSize: 20, marginBottom: 20, color: '#444' },
    planContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 20,
        margin: 10,
        width: 300,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    planName: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    price: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    pricePer: { fontSize: 16, fontWeight: 'normal', color: '#555' },
    text: { fontSize: 16, color: '#555', marginBottom: 20, textAlign: 'center' },
    activeText: { color: 'green', fontWeight: 'bold' },
    button: { backgroundColor: '#3A86FF', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#cc0000', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, marginTop: 10 },
    buttonTextSecondary: { color: '#cc0000', fontSize: 16, fontWeight: 'bold' },
});