import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView} from 'react-native';
import {useDispatch, useSelector} from "react-redux";
import { useQueryClient } from "react-query";
import { useSubscriptionStatus } from "../../../api/hooks/useSubscriptionStatus";
import { useCreateSubscription } from "../../../api/hooks/useCreateSubscription";
import { useCancelSubscription } from "../../../api/hooks/useCancelSubscription";
import { formatDate } from "../../../utils/date";
import {Button, Dialog, Portal, Snackbar} from "react-native-paper";
import {useVerifyAutoLoginToken} from "../../../api/hooks/useVerifyAutoLoginToken";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {setMerchant} from "../../../store/merchantSlice";
import {setAllStores} from "../../../store/allStoresSlice";
import {setAuthenticationStatus as setGlobalAuthProcessStatus} from "../../../store/authSlice";
import {useSelectStore} from "../../../api/hooks/useSelectStore";
import {useRouter} from "expo-router";

// --- Reusable Components defined within the file for simplicity ---

const SubscriptionCard = ({ subscription, onCancel, isCancelling }) => {
    // A subscription is cancellable only if it's 'active'
    const isCancellable = subscription.subscriptionStatus === 'active' || subscription.subscriptionStatus === 'authenticated' ;

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

// Reusable component for showing plan options.
const PlanSelectionView = ({ onSubscribe, isSubscribing }) => {

    return (
        <View>
            <View style={styles.planContainer}>
                <View style={styles.card}>
                    <>
                    <Text style={styles.planName}>Monthly Plan</Text>
                    <Text style={styles.price}>₹2,000 <Text style={styles.pricePer}>/ month</Text></Text>
                    <Text style={styles.text}>Flexibility to pay month-to-month.</Text>
                    </>
                    <Pressable style={styles.button} disabled={isSubscribing} onPress={() => onSubscribe('monthly')}>
                        <Text style={styles.buttonText}>Choose Monthly</Text>
                    </Pressable>
                </View>
                <View style={styles.card}>
                    <>
                    <Text style={styles.planName}>Annual Plan</Text>
                    <Text style={styles.price}>₹22,000 <Text style={styles.pricePer}>/ year</Text></Text>
                    <Text style={styles.text}>Save money with an annual commitment.</Text>
                    </>
                    <Pressable style={styles.button} disabled={isSubscribing} onPress={() => onSubscribe('annual')}>
                        <Text style={styles.buttonText}>Choose Annual</Text>
                    </Pressable>
                </View>
            </View>
            {isSubscribing && <ActivityIndicator size="large" style={{marginTop: 20}}/>}
        </View>
    );
}

export default function BillingPage() {
    const { storeId, storeName, storeEmail, storePhone } = useSelector((state) => state.store);
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isCancelDialogVisible, setIsCancelDialogVisible] = useState(false);
    const [subToCancel, setSubToCancel] = useState(null); // Store which sub to cancel
    const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
    const selectStoreMutation = useSelectStore(dispatch, router);

    const { data: statusData, isLoading, isError, error, refetch: refetchStatus } = useSubscriptionStatus(storeId);

    const { mutate: createSubscription, isLoading: isSubscribing } = useCreateSubscription({
        onSuccess: (data) => {
            if (!data.subscriptionId) return Alert.alert("Error", "Could not retrieve subscription details.");

            const options = {
                key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
                subscription_id: data.subscriptionId,
                name: "RocketShop",
                description: `Subscription for ${storeName}`,
                handler: function (response) {
                    // Instead of just an alert, we trigger the verification UI and polling process.
                    startVerificationPolling();
                },
                prefill: { name: storeName, email: storeEmail, contact: storePhone },
                modal: { ondismiss: () => console.log('Payment modal was closed.') },
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
            setSnackbar({ visible: true, message: 'Subscription successfully cancelled.' });
        },
        onError: (err) => {
            setSnackbar({ visible: true, message: err.response?.data?.message || 'Could not cancel subscription.' });
        },
    });

    const { mutate: verifyToken } = useVerifyAutoLoginToken({
        onSuccess: async (data) => {
            const {accessToken, merchant, stores, targetStoreId} = data;
            console.log('stores: ', stores);
            console.log('targetStoreId: ', targetStoreId);
            await AsyncStorage.setItem('accessToken', accessToken);
            dispatch(setMerchant(merchant));
            dispatch(setAllStores({stores}));
            dispatch(setGlobalAuthProcessStatus('AUTHENTICATED'));
            selectStoreMutation.mutate( {store: stores.find(s => s.storeId === targetStoreId), noRedirect: true});
        },
        onError: (err) => {
            console.log(err);
            alert(err.response?.data?.message || "The login link is invalid or has expired.");
        }
    });

    useEffect(() => {
        // When the component loads, check the URL for a token
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const targetStoreIdParam = params.get('storeId');
        console.log('useEffect targetStoreIdParam: ', targetStoreIdParam);


        if (token && targetStoreIdParam) {
            // If a token is found, call the mutation
            verifyToken({token, targetStoreId: targetStoreIdParam});
            // Clean the token from the URL for security
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []); // Run only once when the page loads

    const startVerificationPolling = async () => {
        setIsVerifying(true);

        const MAX_ATTEMPTS = 100;
        const POLLING_INTERVAL = 3000; // 3 seconds

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            console.log(`Polling for subscription status, attempt #${attempt}...`);

            // Manually refetch the query. refetch() returns a promise with the latest query result.
            const { data: latestStatusData } = await refetchStatus();

            const subscriptions = latestStatusData?.subscriptions || [];
            const isNowActiveOrPending = subscriptions.some(s => s.subscriptionStatus === 'active' || s.subscriptionStatus === 'authenticated');

            // If we find the correct status, stop polling and show success.
            if (isNowActiveOrPending) {
                setIsVerifying(false);
                Alert.alert("Success!", "Your subscription is now active.");
                return; // Exit the function
            }

            // If not successful, wait for the next attempt.
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        }

        // If the loop finishes without success, it has timed out.
        setIsVerifying(false);
        Alert.alert(
            "Payment Received",
            "We are processing your subscription. Your status will be updated shortly. Please check back in a moment."
        );
    };


    const handleSubscribe = (planType) => createSubscription({ planType, storeId });
    const handleCancel = (subscriptionId) => {
        setSubToCancel(subscriptionId); // Remember which subscription we're cancelling
        setIsCancelDialogVisible(true);
    };

    const confirmCancellation = () => {
        if (subToCancel) {
            cancelSubscription({ storeId, subscriptionId: subToCancel });
        }
        setIsCancelDialogVisible(false); // Close the dialog
    };

    if (isVerifying) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Verifying Payment</Text>
                <ActivityIndicator size="large" color="#3A86FF" />
                <Text style={styles.subHeader}>Please wait, we are confirming your subscription...</Text>
                <Text style={styles.text}>This may take a minute or two. Please do not close this page.</Text>
            </View>
        );
    }

    const renderContent = () => {
        if (isLoading) return <ActivityIndicator size="large" color="#3A86FF" />;
        if (isError) return <Text style={styles.errorText}>Error fetching status: {error.message}</Text>;

        const subscriptions = statusData?.subscriptions || [];
        const hasActiveOrPendingSub = subscriptions.some(s => s.subscriptionStatus === 'active' || s.subscriptionStatus === 'authenticated');

        return (
            <ScrollView>
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
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Subscription Management</Text>
            {isLoading ? <ActivityIndicator size="large" color="#3A86FF" /> : renderContent()}
            {isError && <Text style={styles.errorText}>Error fetching status: {error.message}</Text>}

            <Portal>
                <Dialog visible={isCancelDialogVisible} onDismiss={() => setIsCancelDialogVisible(false)} style={{maxWidth:400, alignSelf: 'center'}}>
                    <Dialog.Title>Confirm Cancellation</Dialog.Title>
                    <Dialog.Content>
                        <Text>Are you sure you want to cancel? Your plan will remain active until the end of the current billing period.</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setIsCancelDialogVisible(false)}>Go Back</Button>
                        <Button onPress={confirmCancellation} textColor="red">Confirm</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ visible: false, message: '' })}
                duration={Snackbar.DURATION_MEDIUM}
                action={{
                    label: 'Close',
                    onPress: () => setSnackbar({ visible: false, message: '' }),
                }}
            >
                {snackbar.message}
            </Snackbar>
        </View>
    );
}

// Stylesheet created once outside the component for performance.
const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center', backgroundColor: '#fff' },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    subHeader: { fontSize: 20, marginTop: 20, marginBottom: 10, color: '#444', textAlign: 'center' },
    planContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
    card: { justifyContent: "space-between", margin: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 20, marginVertical: 10, width: 320, minHeight: 250, alignSelf: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
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