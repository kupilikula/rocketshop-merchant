import { clearStore } from "../storeSlice";
import { clearMerchant } from "../merchantSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {disconnectAllSockets} from "@/api/websocket";
import axios from "axios";
import {BASE_URL} from '@/config/config';
import {clearAllStores} from "@/store/allStoresSlice";
import {setAuthenticationStatus} from "@/store/authSlice";
import {clearStoreSettings} from "@/store/storeSettingsSlice";
import {persistor} from "../store";
import {RESET_ALL} from "./resetAll";

export const logout =  (router) => async (dispatch, getState) => {
        try {
                console.log('logging out. Calling /auth/logout');

                // Make logout API call
                await axios.post(`${BASE_URL}/auth/logout`,
                    {
                            merchantId: getState().merchant.merchantId,
                            expoPushToken: getState().pushToken.expoPushToken,
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

                dispatch({ type: RESET_ALL });
                router.replace('/Authentication');


                // ✅ Purge persisted Redux storage
                await persistor.purge();



                console.log('Logged out locally.');

                // Navigate to the Authentication screen

        }
};