import {View, Text, ActivityIndicator} from "react-native";
import {useEffect} from "react";
import axiosClient from "../api/client";
import {setMerchant} from "../store/merchantSlice";
import {setStore} from "../store/storeSlice";
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "expo-router";
import {Surface, useTheme} from "react-native-paper";

export default function Authentication() {

    // const {data: merchantStores, isLoading, isError} = useMerchantStores();
    const dispatch = useDispatch();
    const theme = useTheme();
    const merchantId = useSelector((state) => state.merchant.merchantId);
    const router = useRouter();

    // Get storeId and merchantId from backend
    useEffect(() => {
        axiosClient.post('/login', {storeIndex: 10}).then((res) => {
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
    <Surface style={{width: '100%', height: '100%', backgroundColor: theme.colors.surface, justifyContent: 'center'}}>
      <ActivityIndicator color={theme.colors.primary} size={100} animating={true}/>
    </Surface>
  );
}
