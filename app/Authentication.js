import {View, Text, ActivityIndicator} from "react-native";
import React, {useEffect, useState} from "react";
import axiosClient from "../api/client";
import {setMerchant} from "../store/merchantSlice";
import {setStore} from "../store/storeSlice";
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "expo-router";
import {Button, Surface, TextInput, useTheme} from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Authentication() {

    // const {data: merchantStores, isLoading, isError} = useMerchantStores();
    const dispatch = useDispatch();
    const theme = useTheme();
    const merchantId = useSelector((state) => state.merchant.merchantId);
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');


    // Get storeId and merchantId from backend
        const authenticate = async () => {
            try {
                const response = await axiosClient.post('/auth/login', { phone: phone, otp: otp, storeIndex: 10 });
                const { accessToken, merchant, store } = response.data;
                console.log('login response.data', response.data);
                dispatch(setMerchant(merchant));
                dispatch(setStore(store));
                await AsyncStorage.setItem('accessToken', accessToken); // Save token to AsyncStorage
            } catch (error) {
                console.error('Login failed', error);
            }
        };


    useEffect(() => {
        if (merchantId) {
            router.replace('./Main');
        }
    },[merchantId])

    return (
    <Surface style={{width: '100%', height: '100%', backgroundColor: theme.colors.surface, justifyContent: 'center'}}>
        <View>
            <TextInput
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                inputMode={'numeric'}
                style={{backgroundColor:'white'}}
            />
            <TextInput
                label="OTP"
                value={otp}
                onChangeText={setOtp}
                mode="outlined"
                inputMode={'numeric'}
                style={{backgroundColor:'white'}}
            />
            <Button onPress={() => authenticate() }>Login</Button>
        </View>
        {/*<ActivityIndicator color={theme.colors.primary} size={100} animating={true}/>*/}
    </Surface>
  );
}
