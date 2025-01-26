import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from "../../api/client";
import {clearMerchant} from "../merchantSlice";
import {clearStore} from '../storeSlice';
export const logout = async (dispatch, router) => {
        AsyncStorage.removeItem('accessToken');
        axiosClient.post('/auth/logout');
        dispatch(clearMerchant());
        dispatch(clearStore());
        router.push('/Authentication');
};