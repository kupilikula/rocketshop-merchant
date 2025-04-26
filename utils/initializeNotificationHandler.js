import * as Notifications from "expo-notifications";
import {Platform} from "react-native";

/**
 * Initializes foreground notification behavior.
 * Call this once at app startup (before listeners are registered).
 */
export function initializeNotificationHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
            const type = notification.request?.content?.data?.type;

            switch (type) {
                default:
                    return {
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: false,
                    };
            }
        },
    });
}

export async function initializeNotificationChannels() {
    if (Platform.OS !== 'android') return;

    await Notifications.setNotificationChannelAsync('orders', {
        name: 'Orders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6F59', // match your theme color
    });

    await Notifications.setNotificationChannelAsync('chatMessages', {
        name: 'Chat Messages',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
        vibrationPattern: [0, 150, 100, 150],
        lightColor: '#3A86FF',
    });

    await Notifications.setNotificationChannelAsync('miscellaneous', {
        name: 'Miscellaneous',
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        enableVibrate: false,
        lightColor: '#FFBE0B',
    });

    await Notifications.setNotificationChannelAsync('ratings', {
        name: 'Ratings & Reviews',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: null,
        lightColor: '#8E44AD',
    });
    await Notifications.setNotificationChannelAsync('follows', {
        name: 'Follows',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: null,
        lightColor: '#8E44AD',
    });
}