// components/AppShell.js
import React, {useEffect, useRef} from 'react';
import {Platform, View} from 'react-native';
import { Stack } from 'expo-router';
import StoreSelectorHeader from "@/components/StoreSelectorHeader";
import {useTheme} from "react-native-paper";
import {useSelector} from "react-redux";
import {registerForPushNotificationsAsync} from "../utils/registerForPushNotificationsAsync";
import axiosClient from "../api/client";
import * as Device from "expo-device";
import {setPushToken} from "../store/pushTokenSlice";

export default function AppShell() {

    const theme = useTheme();
    const isAuthenticated = useSelector((state) => state.auth.authenticationStatus==='AUTHENTICATED');
    const {merchantId} = useSelector((state) => state.merchant);
    const pushTokenSent = useRef(false); // avoid resending in the same session
    console.log('AppShell', isAuthenticated, merchantId, pushTokenSent.current);

    useEffect(() => {
        if (!isAuthenticated) {
            pushTokenSent.current = false;
        }
    }, [isAuthenticated]);

    useEffect(() => {
        async function sendPushTokenIfNeeded() {
            if (
                isAuthenticated &&
                merchantId &&
                !pushTokenSent.current
            ) {
                console.log('1 registering push token');
                const pushToken = await registerForPushNotificationsAsync();
                console.log('pushToken', pushToken);
                if (pushToken) {
                    try {
                        console.log('2 registering push token');
                        await axiosClient.post('/registerPushToken', {
                            expoPushToken: pushToken,
                            deviceInfo: {
                                platform: Platform.OS,
                                model: Device.modelName,
                                osVersion: Device.osVersion,
                            },
                        });
                        pushTokenSent.current = true;
                        store.dispatch(setPushToken(pushToken));
                    } catch (err) {
                        console.error('Failed to register push token', err);
                    }
                }
            }
        }

        sendPushTokenIfNeeded();
    }, [isAuthenticated, merchantId]);

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
            <Stack screenOptions={{ header: () => null, contentStyle: {backgroundColor: theme.colors.surface}} }>
                <Stack.Screen name="index"  options={{ headerShown: false }}/>
                <Stack.Screen name="Main"  options={{ headerShown: false }}/>
                <Stack.Screen name="Authentication"  options={{ headerShown: false }}/>
                <Stack.Screen name="StoreSelector"  options={{ headerShown: false }}/>
                <Stack.Screen name="CreateStore"  options={{ headerShown: false }}/>
            </Stack>
        </View>
    );
}