import { clearStore } from "../storeSlice";
import { clearMerchant } from "../merchantSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {disconnectAllSockets} from "@/api/websocket";
import axios from "axios";
import {BASE_URL} from '@/config/config';
import {clearAllStores} from "@/store/allStoresSlice";
import {setAuthenticationStatus} from "@/store/authSlice";
import {clearStoreSettings} from "@/store/storeSettingsSlice";

export const logout = async (dispatch, router) => {
        try {
                console.log('logging out. Calling /auth/logout');

                // Make logout API call
                await axios.post(`${BASE_URL}/auth/logout`,
                    {
                            expoPushToken: 'placeholder',
                    },
                    { withCredentials: true });

                console.log('Logout API call succeeded.');
        } catch (error) {
                console.error('Error during logout:', error.message || error);
        } finally {
                // Clear access token from AsyncStorage
                await AsyncStorage.removeItem('accessToken');

                // Disconnect all active sockets
                disconnectAllSockets();


                // Clear Redux state
                dispatch(setAuthenticationStatus('UNAUTHENTICATED'));
                router.replace('/Authentication');
                dispatch(clearMerchant());
                dispatch(clearStore());
                dispatch(clearAllStores());
                dispatch(clearStoreSettings());

                console.log('Logged out locally.');

                // Navigate to the Authentication screen

        }
};