import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, useTheme, Divider, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

export default function StoreSettingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const store = useSelector((state) => state.store.storeData); // Assuming full storeData is stored

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

            <List.Section title="Store Wide Defaults" titleStyle={styles.sectionTitle}>
                <List.Item
                    title="GST Enabled"
                    titleStyle={{fontSize: 16}}
                    right={() => (
                        <Switch
                            value={true}
                            onValueChange={() => {}}
                            style={{marginLeft: 16}}
                        />
                    )}
                    style={styles.listItem}
                />
            <List.Item
                title="GST Inclusive"
                titleStyle={{fontSize: 16}}
                right={() => (
                    <Switch
                        value={true}
                        onValueChange={() => {}}
                        style={{marginLeft: 16}}
                    />
                )}
                style={styles.listItem}
            />
                <List.Item
                    title="Enable Ratings & Reviews"
                    titleStyle={{fontSize: 16}}
                    right={() => (
                        <Switch
                            value={true}
                            onValueChange={() => {}}
                            style={{marginLeft: 16}}
                        />
                    )}
                    style={styles.listItem}
                />
            </List.Section>
            <Divider />
                <List.Item
                    title="Switch Store"
                    titleStyle={{fontSize: 20}}
                    onPress={() => router.replace('/StoreSelector')}
                    style={styles.listItem}
                />
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