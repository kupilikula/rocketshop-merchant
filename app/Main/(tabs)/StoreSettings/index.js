import React, {useState} from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, useTheme, Divider, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import GstRateDropdown from "../../../../components/GstRateDropdown";
import ConfirmDeactivateStoreModal from "../../../../components/ConfirmDeactivateStoreModal";
import ConfirmActivateStoreModal from "../../../../components/ConfirmActivateStoreModal";
import ConfirmDeleteStoreModal from "../../../../components/ConfirmDeleteStoreModal";

export default function StoreSettingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const store = useSelector((state) => state.store);
    const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
    const [activateModalVisible, setActivateModalVisible] = useState(false);
    const [deleteStoreModalVisible, setDeleteStoreModalVisible] = useState(false);

    return (
        <>
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
                    onPress={() => router.push('/Main/(tabs)/StoreSettings/PaymentSettings')}
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

            <Divider />
            { store.isActive ?
                <List.Item
                    title="Deactivate Store"
                    titleStyle={{fontSize: 20}}
                    onPress={() => setDeactivateModalVisible(true)}
                    style={styles.listItem}
                /> :
                <List.Item
                    title="Activate Store"
                    titleStyle={{fontSize: 20}}
                    onPress={() => setActivateModalVisible(true)}
                    style={styles.listItem}
                    />
            }
            <Divider />
            { !store.isActive &&
                <List.Item
                    title="Delete Store"
                    titleStyle={{ color: theme.colors.error, fontSize: 20}}
                    onPress={() => setDeleteStoreModalVisible(true)}
                    style={styles.listItem}
                />
            }
        </ScrollView>
            {store.isActive &&
    <ConfirmDeactivateStoreModal
        visible={deactivateModalVisible}
        onDismiss={() => setDeactivateModalVisible(false)}
        storeId={store.storeId}
        storeName={store.storeName}
    />}
            {!store.isActive &&
                <ConfirmActivateStoreModal
                    visible={activateModalVisible}
                    onDismiss={() => setActivateModalVisible(false)}
                    storeId={store.storeId}
                    storeName={store.storeName}
                />
            }
            {!store.isActive &&
                <ConfirmDeleteStoreModal
                    visible={deleteStoreModalVisible}
                    onDismiss={() => setDeleteStoreModalVisible(false)}
                    storeId={store.storeId}
                    storeName={store.storeName}
                />

            }

    </>
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