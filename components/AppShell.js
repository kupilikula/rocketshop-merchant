// components/AppShell.js
import React, {useEffect, useRef} from 'react';
import {Platform, View} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {useTheme} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";
import {registerForPushNotificationsAsync} from "../utils/registerForPushNotificationsAsync";
import { getAxiosClient } from "../api/client";
import * as Device from "expo-device";
import {setPushToken} from "../store/pushTokenSlice";
import * as Notifications from "expo-notifications";
import {handleNotificationNavigation} from "../utils/handleNotificationNavigation";
import {useAppStateSyncUnreadMessages} from "../api/hooks/useAppStateSyncUnreadMessages";
import {disconnectSocket, getSocket} from "../api/websocket";
import {addUnreadMessage} from "../store/badgesSlice";
import {useQueryClient} from "react-query";


const IS_WEB = Platform.OS === 'web';

export default function AppShell() {

    const router = useRouter();
    const theme = useTheme();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    const isAuthenticated = useSelector((state) => state.auth.authenticationStatus==='AUTHENTICATED');
    const {merchantId} = useSelector((state) => state.merchant);
    const storeId = useSelector((state) => state.store.storeId);
    const pushTokenSent = useRef(false); // avoid resending in the same session
    console.log('AppShell', isAuthenticated, merchantId, pushTokenSent.current);

    useEffect(() => {
        const socketType = "global"; // Define the socket type
        console.log('global useEffect');
        // Function to initialize and manage the global socket connection
        const initializeSocket = async () => {
            if (!merchantId || !storeId) {
                console.error("Merchant ID or storeId not found. Cannot initialize global socket.");
                return;
            }
            const socket = await getSocket(socketType, null, storeId); // Get or connect the global socket
            if (!socket) {
                console.error("Failed to initialize the global socket.");
                return;
            }

            console.log(`Global socket initialized, ID: ${socket.id} , merchantId: ${merchantId}`);
            console.log(`Existing "newMessage" listeners:`, socket.listeners("newMessage").length);

            // Remove any existing listeners
            socket.removeAllListeners("newMessage");

            // Add the 'newMessage' listener
            socket.on("newMessage", (message) => {
                console.log("Received newMessage event:", message);
                console.log(`Active "newMessage" listeners:`, socket.listeners("newMessage").length);
                console.log("newMessage socket.id:", socket.id);

                // Update Redux store
                dispatch(addUnreadMessage({chatId: message.chatId, message}));

                // Invalidate 'chats' query
                queryClient.invalidateQueries(["chats"]);
            });

            console.log("Global socket listener for 'newMessage' added.");
        };

        const handleReconnect = async () => {
            console.log("Socket reconnected. Reinitializing listeners...");
            await initializeSocket(); // Reattach listeners after reconnection
        };

        const attachReconnectHandler = async () => {
            const socket = await getSocket(socketType);
            if (!socket) {
                console.error("Failed to attach reconnect handler: Global socket not initialized.");
                return;
            }

            // Ensure only one reconnect handler is active
            socket.off("connect", handleReconnect);
            socket.on("connect", handleReconnect);
        };

        const setupSocket = async () => {
            if (merchantId && storeId) {
                await initializeSocket();
                await attachReconnectHandler();
            }
        };

        setupSocket();

        // Clean up on unmount
        return () => {
            disconnectSocket(socketType); // Disconnect the global socket
        };
    }, [merchantId, storeId]); // Re-run when merchantId changes

    if (!IS_WEB) {
        useAppStateSyncUnreadMessages(storeId);
    }

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
                        dispatch(setPushToken(pushToken));
                    } catch (err) {
                        console.error('Failed to register push token', err);
                    }
                }
            }
        }
        if (!IS_WEB) {
            sendPushTokenIfNeeded();
        }

    }, [isAuthenticated, merchantId, axiosClient, dispatch]);

    useEffect(() => {

        if (!!IS_WEB) {
            const subscription = Notifications.addNotificationResponseReceivedListener(response => {
                const content = response.notification.request.content;
                console.log('Notification tapped with content:', content);
                const {data} = response.notification.request.content;

                console.log('Notification tapped with data:', data);

                if (data?.type) {
                    handleNotificationNavigation(data, router);
                }
            });

            return () => subscription.remove();
        }
    }, [router]);

    useEffect(() => {
        const checkInitialNotification = async () => {
            if (IS_WEB) {
                return;
            }
            const initialNotification = await Notifications.getLastNotificationResponseAsync();
            if (initialNotification?.notification?.request?.content?.data) {
                const data = initialNotification.notification.request.content.data;
                console.log('Initial notification tapped:', data);

                if (data?.type) {
                    handleNotificationNavigation(data, router);
                }
            }
        };
        if (!IS_WEB) {
            checkInitialNotification();
        }
    }, [router]);

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