import { View, Text } from "react-native";
import {useEffect} from "react";
import axiosClient from "../api/client";
import {setMerchant} from "../store/merchantSlice";
import {setStore} from "../store/storeSlice";
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "expo-router";
import {useTheme} from "react-native-paper";

export default function Authentication() {

    const dispatch = useDispatch();
    const theme = useTheme();
    const merchantId = useSelector((state) => state.merchant.merchantId);
    const router = useRouter();

    // Get storeId and merchantId from backend
    useEffect(() => {
        axiosClient.post('/login', {storeIndex: 1}).then((res) => {
            dispatch(setMerchant(res.data.merchant ));
            dispatch(setStore(res.data.store));
        })
    },[])

    useEffect(() => {
        if (merchantId) {
            router.replace('./Main');
        }
    },[merchantId])

    return (
    <View style={{width: '100%', height: '100%', backgroundColor: theme.colors.surface}}>
      <Text>Logging In</Text>
    </View>
  );
}
