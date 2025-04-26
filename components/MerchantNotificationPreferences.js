// app/Main/(tabs)/Settings/MerchantNotificationPreferences.js

import React, {useEffect, useMemo, useState} from 'react';
import { View, ScrollView } from 'react-native';
import {Text, Switch, Button, Snackbar, ActivityIndicator, useTheme, Card, Divider, Portal} from 'react-native-paper';
import { useMerchantStoreNotificationPreferences } from '../api/hooks/useMerchantStoreNotificationPreferences';
import { useUpdateMerchantStoreNotificationPreferences } from '../api/hooks/useUpdateMerchantStoreNotificationPreferences';
import { useSelector } from 'react-redux';
import { useQueryClient } from 'react-query';

const MerchantNotificationPreferences = () => {
    const theme = useTheme();
    const { storeId } = useSelector((state) => state.store); // Assuming you have selected storeId in Redux
    const { merchantId } = useSelector((state) => state.merchant);
    const { data: preferences, isLoading, isError } = useMerchantStoreNotificationPreferences(storeId, merchantId);
    const { mutate: updatePreferences, isLoading: isUpdating } = useUpdateMerchantStoreNotificationPreferences(storeId, merchantId);
    const [localPrefs, setLocalPrefs] = useState({});
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const queryClient = useQueryClient();

    const effectivePrefs = useMemo(() => ({ ...preferences, ...localPrefs }), [preferences, localPrefs]);

    const togglePreference = (key) => {
        setLocalPrefs((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = () => {
        updatePreferences(localPrefs, {
            onSuccess: async () => {
                await queryClient.invalidateQueries(['merchantStoreNotificationPreferences', storeId, merchantId]);
                setLocalPrefs({});
                setSnackbarVisible(true);
            },
        });
    };

    const isDirty = Object.keys(localPrefs).length > 0;
    console.log('localPrefs:', localPrefs);

    if (isLoading) {
        return <ActivityIndicator animating={true} size="large" style={{ flex: 1 }} />;
    }

    if (isError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Failed to load preferences.</Text>
            </View>
        );
    }

    return (
        <>
        <Card style={{ flex: 1, padding: 16, backgroundColor: theme.colors.surface, borderRadius: 0 }}>
            <Text variant="titleLarge" style={{marginBottom: 16}}>Notification Preferences</Text>

            <Divider style={{ marginVertical: 4 }}/>
            <View style={{ marginVertical: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium">Mute All Notifications</Text>
                <Switch
                    value={effectivePrefs.muteAll}
                    onValueChange={() => togglePreference('muteAll')}
                />
            </View>
            <Divider style={{ marginVertical: 4 }}/>
            <View style={{ marginVertical: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium">New Orders</Text>
                <Switch
                    value={effectivePrefs.newOrders}
                    onValueChange={() => togglePreference('newOrders')}
                />
            </View>
            <Divider style={{ marginVertical: 4 }}/>

            <View style={{ marginVertical: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium">Chat Messages</Text>
                <Switch
                    value={effectivePrefs.chatMessages}
                    onValueChange={() => togglePreference('chatMessages')}
                />
            </View>
            <Divider style={{ marginVertical: 4 }}/>

            <View style={{ marginVertical: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium">Return Requests</Text>
                <Switch
                    value={effectivePrefs.returnRequests}
                    onValueChange={() => togglePreference('returnRequests')}
                />
            </View>
            <Divider style={{ marginVertical: 4 }}/>

            <View style={{ marginVertical: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium">Order Cancellations</Text>
                <Switch
                    value={effectivePrefs.orderCancellations}
                    onValueChange={() => togglePreference('orderCancellations')}
                />
            </View>
            <Divider style={{ marginVertical: 4 }}/>

            <View style={{ marginVertical: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium">Ratings and Reviews</Text>
                <Switch
                    value={effectivePrefs.ratingsAndReviews}
                    onValueChange={() => togglePreference('ratingsAndReviews')}
                />
            </View>
            <Divider style={{ marginVertical: 4 }}/>

            <View style={{ marginVertical: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium">New Followers</Text>
                <Switch
                    value={effectivePrefs.newFollowers}
                    onValueChange={() => togglePreference('newFollowers')}
                />
            </View>
            <Divider style={{ marginVertical: 4 }}/>
            <View style={{ marginVertical: 8, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="titleMedium">Miscellaneous</Text>
                <Switch
                    value={effectivePrefs.miscellaneous}
                    onValueChange={() => togglePreference('miscellaneous')}
                />
            </View>
            <Divider style={{ marginVertical: 4 }}/>

            {isDirty &&
            <Button
                mode="contained"
                onPress={handleSave}
                loading={isUpdating}
                disabled={isUpdating}
                style={{ marginTop: 16 }}
            >
                Save Changes
            </Button>}
        </Card>
        <Portal>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
                style={{ backgroundColor: theme.colors.softSuccess }}
                theme={{ colors: { inverseOnSurface: 'black' }}}
            >
                Preferences updated successfully!
            </Snackbar>
        </Portal>
    </>
    );
};

export default MerchantNotificationPreferences;