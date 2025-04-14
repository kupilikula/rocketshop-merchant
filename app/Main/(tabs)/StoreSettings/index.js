import React, {useState} from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, useTheme, Divider, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import GstRateDropdown from "../../../../components/GstRateDropdown";

export default function StoreSettingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const store = useSelector((state) => state.store);
    const [defaultGstRate, setDefaultGstRate] = useState(18);
    const [defaultGstEnabled, setDefaultGstEnabled] = useState(true);
    const [defaultGstInclusive, setDefaultGstInclusive] = useState(true);


    return (
        <ScrollView style={{backgroundColor: 'white'}} contentContainerStyle={styles.container}>
            {/* Store Details */}
                <List.Item
                    title="Store Details"
                    titleStyle={{fontSize: 20}}
                    // description="Name, Logo, Handle, Description, Tags"
                    onPress={() => router.push('/Main/(tabs)/StoreSettings/EditStoreDetails')}
                    style={styles.listItem}
                />
                <Divider />
                <List.Item
                    title="Payment Settings"
                    titleStyle={{fontSize: 20}}
                    onPress={() => router.push('/StoreSettings/Razorpay')}
                    style={styles.listItem}
                />
                <Divider />
                <List.Item
                    title="Manage Merchants"
                    titleStyle={{fontSize: 20}}
                    // description="Add / Remove / Change Role"
                    onPress={() => router.push('/Main/(tabs)/StoreSettings/MerchantManagement')}
                    style={styles.listItem}
                />
                <Divider />

            <List.Item title="GST Settings"
                       titleStyle={styles.sectionTitle}
                       style={styles.listItem}
                       onPress={() => router.push('/Main/(tabs)/StoreSettings/GstSettings')}
            />
            {/*    <List.Item*/}
            {/*        title="GST Enabled"*/}
            {/*        titleStyle={{fontSize: 16}}*/}
            {/*        right={() => (*/}
            {/*            <Switch*/}
            {/*                value={defaultGstEnabled}*/}
            {/*                onValueChange={setDefaultGstEnabled}*/}
            {/*                style={{marginLeft: 16}}*/}
            {/*            />*/}
            {/*        )}*/}
            {/*        style={styles.listItem}*/}
            {/*    />*/}
            {/*<List.Item*/}
            {/*    title="GST Inclusive"*/}
            {/*    titleStyle={{fontSize: 16}}*/}
            {/*    right={() => (*/}
            {/*        <Switch*/}
            {/*            value={defaultGstInclusive}*/}
            {/*            onValueChange={setDefaultGstInclusive}*/}
            {/*            style={{marginLeft: 16}}*/}
            {/*        />*/}
            {/*    )}*/}
            {/*    style={styles.listItem}*/}
            {/*/>*/}
            {/*    <List.Item*/}
            {/*        title="Default GST Rate"*/}
            {/*        titleStyle={{fontSize: 16}}*/}
            {/*        style={styles.listItem}*/}
            {/*        right={() => (*/}
            {/*            <GstRateDropdown*/}
            {/*                value={defaultGstRate}*/}
            {/*                onChange={(rate) => setDefaultGstRate(rate)}*/}
            {/*                label="Default GST Rate"*/}
            {/*            />*/}
            {/*        )}*/}
            {/*    />*/}

            <Divider />
                <List.Item
                    title="Deactivate Store"
                    titleStyle={{fontSize: 20}}
                    onPress={() => router.push('/StoreSettings/InactivateStore')}
                    style={styles.listItem}
                />
            <Divider />
                <List.Item
                    title="Delete Store"
                    titleStyle={{ color: theme.colors.error, fontSize: 20}}
                    onPress={() => router.push('/StoreSettings/DeleteStore')}
                    style={styles.listItem}
                />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: 'white',
        flexGrow: 1
    },
    listItem: {
        paddingVertical: 12,
    },
    sectionTitle: {
        marginBottom: 0,
        fontSize: 20,
        // marginBottom: 12,
    },
});