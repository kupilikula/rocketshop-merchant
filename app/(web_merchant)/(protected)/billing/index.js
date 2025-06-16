import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { useSubscriptionStatus } from "../../../../api/hooks/useSubscriptionStatus";
import { useCreateSubscription } from "../../../../api/hooks/useCreateSubscription";
import { useCancelSubscription } from "../../../../api/hooks/useCancelSubscription";
import { formatDate } from "../../../../utils/date";

// --- Reusable Components defined within the file for simplicity ---

const SubscriptionCard = ({ subscription, onCancel, isCancelling }) => {
    // A subscription is cancellable only if it's 'active'
    const isCancellable = subscription.subscriptionStatus === 'active';

    return (
        <View style={[styles.card, subscription.subscriptionStatus === 'active' && styles.activeBorder]}>
            <Text style={styles.planName}>{subscription.planName}</Text>
            {(() => {
                switch (subscription.subscriptionStatus) {
                    case 'active':
                        return <>
                            <View style={styles.infoRow}><Text style={styles.label}>Status</Text><Text style={[styles.value, styles.activeText]}>Active</Text></View>
                            <View style={styles.infoRow}><Text style={styles.label}>Billing Period</Text><Text style={styles.value}>{`${formatDate(new Date(subscription.periodStart))} - ${formatDate(new Date(subscription.periodEnd))}`}</Text></View>
                            {isCancellable && (
                                <Pressable style={styles.buttonSecondary} disabled={isCancelling} onPress={() => onCancel(subscription.subscriptionId)}>
                                    <Text style={styles.buttonTextSecondary}>{isCancelling ? 'Processing...' : 'Cancel Subscription'}</Text>
                                </Pressable>
                            )}
                        </>;
                    case 'cancelled':
                        return <>
                            <View style={styles.infoRow}><Text style={styles.label}>Status</Text><Text style={[styles.value, styles.warningText]}>Will Not Renew</Text></View>
                            <View style={styles.infoRow}><Text style={styles.label}>Final Period</Text><Text style={styles.value}>{`${formatDate(new Date(subscription.periodStart))} - ${formatDate(new Date(subscription.periodEnd))}`}</Text></View>
                            <Text style={styles.inactiveText}>Access will expire on {formatDate(new Date(subscription.periodEnd))}.</Text>
                        </>;
                    case 'authenticated':
                        return <>
                            <View style={styles.infoRow}><Text style={styles.label}>Status</Text><Text style={[styles.value, styles.infoText]}>Scheduled</Text></View>
                            <View style={styles.infoRow}><Text style={styles.label}>First Period</Text><Text style={styles.value}>{`${formatDate(new Date(subscription.periodStart))} - ${formatDate(new Date(subscription.periodEnd))}`}</Text></View>
                            <Text style={styles.inactiveText}>This plan will become active on the start date.</Text>
                        </>;
                    default:
                        return null;
                }
            })()}
        </View>
    );
};

const PlanSelectionView = ({ onSubscribe, isSubscribing }) => (
    <View>
        <View style={styles.planContainer}>
            <View style={styles.card}>
                <Text style={styles.planName}>Monthly Plan</Text>
                <Text style={styles.price}>₹2,000 <Text style={styles.pricePer}>/ month</Text></Text>
                <Pressable style={styles.button} disabled={isSubscribing} onPress={() => onSubscribe('monthly')}><Text style={styles.buttonText}>Choose Monthly</Text></Pressable>
            </View>
            <View style={styles.card}>
                <Text style={styles.planName}>Annual Plan</Text>
                <Text style={styles.price}>₹22,000 <Text style={styles.pricePer}>/ year</Text></Text>
                <Pressable style={styles.button} disabled={isSubscribing} onPress={() => onSubscribe('annual')}><Text style={styles.buttonText}>Choose Annual</Text></Pressable>
            </View>
        </View>
        {isSubscribing && <ActivityIndicator size="large" style={{ marginTop: 20 }}/>}
    </View>
);

export default function BillingPage() {
    const { storeId, storeName, storeEmail, storePhone } = useSelector((state) => state.store);
    const queryClient = useQueryClient();

    const { data: statusData, isLoading, isError, error } = useSubscriptionStatus(storeId);

    const { mutate: createSubscription, isLoading: isSubscribing } = useCreateSubscription({
        onSuccess: (data) => {
            if (!data.subscriptionId) return Alert.alert("Error", "Could not retrieve subscription details.");
            const options = {
                key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID, // Correct ENV variable for Expo
                subscription_id: data.subscriptionId,
                name: "RocketShop",
                description: `Subscription for ${storeName}`,
                handler: () => {
                    Alert.alert("Authorization Successful", "Your status will update shortly.");
                    queryClient.invalidateQueries(['subscriptionStatus', storeId]);
                },
                prefill: { name: storeName, email: storeEmail, contact: storePhone },
                modal: { ondismiss: () => {} },
                theme: { color: "#3A86FF" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        },
        onError: (err) => alert(`Error: ${err.response?.data?.message || err.message}`),
    });

    const { mutate: cancelSubscription, isLoading: isCancelling } = useCancelSubscription({
        onSuccess: () => {
            queryClient.invalidateQueries(['subscriptionStatus', storeId]);
            Alert.alert("Success", "Your subscription has been cancelled.");
        },
        onError: (err) => alert(`Error: ${err.response?.data?.message || err.message}`),
    });

    const handleSubscribe = (planType) => createSubscription({ planType, storeId });
    const handleCancel = (subscriptionId) => {
        if (window.confirm("Are you sure? Your current active plan will be cancelled at the end of the period.")) {
            cancelSubscription({ storeId, subscriptionId }); // Pass subscriptionId to the mutation
        }
    };

    const renderContent = () => {
        if (isLoading) return <ActivityIndicator size="large" color="#3A86FF" />;
        if (isError) return <Text style={styles.errorText}>Error fetching status: {error.message}</Text>;

        const subscriptions = statusData?.subscriptions || [];
        const hasActiveOrPendingSub = subscriptions.some(s => s.subscriptionStatus === 'active' || s.subscriptionStatus === 'authenticated');

        return (
            <View>
                {subscriptions.length > 0 && <Text style={styles.subHeader}>Your Subscriptions</Text>}
                {subscriptions.map(sub => (
                    <SubscriptionCard
                        key={sub.subscriptionId}
                        subscription={sub}
                        onCancel={handleCancel}
                        isCancelling={isCancelling}
                    />
                ))}
                {!hasActiveOrPendingSub && (
                    <View>
                        <Text style={styles.subHeader}>
                            {subscriptions.length > 0 ? 'Resume Your Subscription' : 'Choose a Plan to Activate Your Store'}
                        </Text>
                        <PlanSelectionView onSubscribe={handleSubscribe} isSubscribing={isSubscribing} />
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Subscription Management</Text>
            {renderContent()}
        </View>
    );
}

// Stylesheet created once outside the component for performance.
const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center', backgroundColor: '#fff' },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    subHeader: { fontSize: 20, marginTop: 20, marginBottom: 10, color: '#444', textAlign: 'center' },
    planContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
    card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 20, marginVertical: 10, width: 320, alignSelf: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
    planName: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    price: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    pricePer: { fontSize: 16, fontWeight: 'normal', color: '#555' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eef0f3', },
    label: { fontSize: 16, color: '#6e6e73' },
    value: { fontSize: 14, fontWeight: '600', color: '#1c1c1e', textAlign: 'right', },
    text: { fontSize: 16, color: '#555', marginBottom: 10, textAlign: 'center', lineHeight: 22 },
    inactiveText: { fontSize: 14, color: '#6e6e73', textAlign: 'center', marginTop: 16, lineHeight: 20, },
    boldText: { fontWeight: 'bold' },
    activeText: { color: '#28a745', fontWeight: 'bold' },
    warningText: { color: '#fd7e14', fontWeight: 'bold' },
    infoText: { color: '#007AFF', fontWeight: 'bold' },
    button: { backgroundColor: '#3A86FF', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, marginTop: 10 },
    buttonText: { alignSelf: 'center', color: 'white', fontSize: 16, fontWeight: 'bold' },
    buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#dc3545', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, marginTop: 10 },
    buttonTextSecondary: {alignSelf: 'center', color: '#dc3545', fontSize: 16, fontWeight: 'bold' },
    errorText: { color: 'red', fontSize: 16, marginTop: 15 },
    activeBorder: { borderColor: '#28a745', borderWidth: 2 },
});