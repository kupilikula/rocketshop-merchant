// app/StoreSettings/GstSettings.js

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Checkbox } from "react-native-paper";
import GstRateDropdown from "./GstRateDropdown";

export default function GstSettingsComponent({rate, inclusive, setRate, setInclusive}) {

    return (
        <View style={styles.container}>
            <View style={{ height: 50, marginBottom: 16, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text variant="bodyLarge" style={{ }}>
                    Default GST Rate
                </Text>
                <GstRateDropdown
                    value={rate}
                    onChange={(r) => setRate(r)}
                    label="GST Rate"
                    style={{maxWidth: 100}}
                />
            </View>

            <Checkbox.Item
                label="Default GST Inclusive"
                status={inclusive ? 'checked' : 'unchecked'}
                onPress={() => setInclusive(!inclusive)}
                labelStyle={{ fontSize: 16 }}
                style={styles.listItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        // flex: 1,
        backgroundColor: "white",
    },
    listItem: {
        paddingHorizontal: 0,
    },
});