import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registerForPushNotificationsAsync() {
    console.log("registerForPushNotificationsAsync");
    console.log('Device:', Device.isDevice);

    if (Device.isDevice) {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            console.log('existingStatus:', existingStatus);

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }

            console.log('finalStatus:', finalStatus);

            const tokenData = await Notifications.getExpoPushTokenAsync();
            console.log('tokenData:', tokenData); // <== Catch if any problem
            return tokenData.data;

        } catch (error) {
            console.error('Error in registerForPushNotificationsAsync:', error);
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }
}