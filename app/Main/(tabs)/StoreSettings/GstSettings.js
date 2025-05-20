// app/StoreSettings/GstSettings.js

import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, List, Button, useTheme, Checkbox } from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";
import { useRouter } from "expo-router";
import { getAxiosClient } from "../../../../api/client";
import GstRateDropdown from "../../../../components/GstRateDropdown";
import {setStoreSettings} from "../../../../store/storeSettingsSlice";
import GstSettingsComponent from "../../../../components/GstSettingsComponent"; // Assuming this exists

export default function GstSettingsScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
    const router = useRouter();
    const { storeId } = useSelector((state) => state.store);
    const { defaultGstInclusive, defaultGstRate } = useSelector((state) => state.storeSettings);

    const [inclusive, setInclusive] = useState(defaultGstInclusive);
    const [rate, setRate] = useState(defaultGstRate);

    const handleSave = async () => {
        try {
            const res = await axiosClient.patch(`/stores/${storeId}/updateGstSettings`, {
                defaultGstInclusive: inclusive,
                defaultGstRate: rate,
            });
            dispatch(setStoreSettings(res.data.storeSettings));
            Alert.alert("Success", "GST Settings updated.");
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to update GST Settings.");
        }
    };

    return (
        <View style={styles.container}>
            <GstSettingsComponent rate={rate} setRate={setRate} inclusive={inclusive} setInclusive={setInclusive}/>
            <View style={{ marginTop: 32, flexDirection: "row", justifyContent: "space-between" }}>
                <Button mode="outlined" onPress={() => router.back()} style={{  marginRight: 8, borderRadius: 8, borderColor: theme.colors.error }} labelStyle={{color: theme.colors.error}}>
                    Cancel
                </Button>
                <Button mode="contained" onPress={handleSave} style={{  borderRadius: 8 }}>
                    Save Changes
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: "white",
    },
    listItem: {
        paddingHorizontal: 0,
    },
});