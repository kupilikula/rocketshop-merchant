// app/StoreSettings/MerchantManagement.js

import React, { useState } from "react";
import {View, StyleSheet, ScrollView, Alert, } from "react-native";
import {Text, Card, Button, IconButton, Menu, useTheme, Chip, TextInput, Portal, Modal, RadioButton} from "react-native-paper";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axiosClient from "../../../../api/client";
import PhoneInput from "../../../../components/PhoneInput";

export default function MerchantManagementScreen() {
    const theme = useTheme();
    const router = useRouter();
    const {storeId, merchantRole: currentMerchantRole} = useSelector((state) => state.store);
    const queryClient = useQueryClient();
    const {merchantId: currentMerchantId} = useSelector((state) => state.merchant);

    const [menuOpenFor, setMenuOpenFor] = useState(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [newFullName, setNewFullName]  = useState('');
    const [newMerchantRole, setNewMerchantRole]  = useState('Staff');

    const { data: merchants = [], isLoading } = useQuery({
        queryKey: ["storeMerchants", storeId],
        queryFn: async () => {
            const res = await axiosClient.get(`/stores/${storeId}/getMerchants`);
            return res.data.merchants;
        },
        enabled: !!storeId,
    });

    const handleAddMerchant = async () => {
        if (!newPhone || !newFullName || !newMerchantRole) {
            Alert.alert('Error', 'Phone and Full Name are required.');
            return;
        }

        await axiosClient.post(`/stores/${storeId}/addMerchantToStore`, {
            phone: newPhone,
            fullName: newFullName,
            merchantRole: newMerchantRole,
        });

        setAddModalVisible(false);
        setNewPhone('');
        setNewFullName('');
        queryClient.invalidateQueries(["storeMerchants", storeId]);
    };

    const handleRemoveMerchant = (merchantId) => {
        Alert.alert(
            "Remove Merchant",
            "Are you sure you want to remove this merchant from the store?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        await axiosClient.delete(`/stores/${storeId}/removeMerchantFromStore/${merchantId}`);
                        queryClient.invalidateQueries(["storeMerchants", storeId]);
                        setMenuOpenFor(null);
                    },
                },
            ]
        );
    };

    const handleChangeRole = async (merchantId, newRole) => {
        await axiosClient.patch(`/stores/${storeId}/updateMerchantRole/${merchantId}`, { newMerchantRole: newRole });
        queryClient.invalidateQueries(["storeMerchants", storeId]);
        setMenuOpenFor(null);
    };

    console.log('menuOpenFor:', menuOpenFor);
    console.log('currentMerchantRole:', currentMerchantRole);
    return (
        <>
        <ScrollView style={{backgroundColor: 'white'}} contentContainerStyle={styles.container}>
            {merchants.map((merchant) => (
                <Card key={merchant.merchantId} style={styles.card}>
                    <View style={styles.cardContent}>
                        <View>
                            <Text variant="titleMedium">{merchant.fullName}</Text>
                            <Text variant="titleMedium">{merchant.phone}</Text>

                            <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                                <Chip>{merchant.merchantRole}</Chip>
                                {merchant.merchantId === currentMerchantId && (
                                    <Chip mode="flat" style={{ backgroundColor: theme.colors.primary }}>
                                        You
                                    </Chip>
                                )}
                            </View>
                        </View>

                        {merchant.merchantId !== currentMerchantId && (
                            <Menu
                                contentStyle={{ backgroundColor: 'white' }}
                                visible={menuOpenFor === merchant.merchantId}
                                onDismiss={() => setMenuOpenFor(null)}
                                anchor={
                                    <IconButton
                                        icon="dots-vertical"
                                        onPress={() =>
                                            setMenuOpenFor(
                                                menuOpenFor === merchant.merchantId ? null : merchant.merchantId
                                            )
                                        }
                                    />
                                }
                            >
                                {/* Role Change Options */}
                                {currentMerchantRole === 'Admin' &&
                                    ["Admin", "Manager", "Staff"]
                                        .filter((role) => role !== merchant.merchantRole)
                                        .map((role) => (
                                            <Menu.Item
                                                key={role}
                                                onPress={() => handleChangeRole(merchant.merchantId, role)}
                                                title={`Make ${role}`}
                                                style={{ backgroundColor: 'white' }}
                                            />
                                        ))}

                                {currentMerchantRole === 'Manager' &&
                                    merchant.merchantRole === 'Staff' && (
                                        <Menu.Item
                                            onPress={() => handleChangeRole(merchant.merchantId, 'Manager')}
                                            title="Make Manager"
                                            style={{ backgroundColor: 'white' }}
                                        />
                                    )}

                                {/* Remove Merchant */}
                                {(currentMerchantRole === 'Admin' ||
                                    (currentMerchantRole === 'Manager' && merchant.merchantRole === 'Staff')) && (
                                    <Menu.Item
                                        onPress={() => handleRemoveMerchant(merchant.merchantId)}
                                        title="Remove Merchant"
                                        style={{ backgroundColor: 'white' }}
                                    />
                                )}
                            </Menu>
                        )}
                    </View>
                </Card>
            ))}

            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <Button
                icon={'plus'}
                mode="contained"
                onPress={() => setAddModalVisible(true)}
                style={{ marginTop: 24 }}
            >
                Add Merchant
            </Button>
            </View>
        </ScrollView>
            <Portal>
                <Modal
                    visible={addModalVisible}
                    onDismiss={() => setAddModalVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                        Add Merchant
                    </Text>

                    <PhoneInput setPhone={setNewPhone}/>

                    <TextInput
                        label="Full Name"
                        // value={newFullName}
                        mode="outlined"
                        onChangeText={setNewFullName}
                        style={{ marginBottom: 16, backgroundColor: 'white' }}
                    />

                    <Text variant="titleSmall" style={{ marginBottom: 8 }}>
                        Role
                    </Text>

                    <RadioButton.Group
                        onValueChange={setNewMerchantRole}
                        value={newMerchantRole}
                    >
                        {["Admin", "Manager", "Staff"]
                            .filter((role) => {
                                if (currentMerchantRole === 'Admin') return true;
                                if (currentMerchantRole === 'Manager') return role !== 'Admin';
                                return false; // Staff cannot add merchants
                            })
                            .map((role) => (
                                <View key={role} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <RadioButton value={role} />
                                    <Text>{role}</Text>
                                </View>
                            ))}
                    </RadioButton.Group>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <Button
                        mode="contained"
                        onPress={handleAddMerchant}
                        style={{ marginTop: 16, borderRadius: 8}}
                    >
                        Add
                    </Button>
                    </View>
                </Modal>
            </Portal>
            </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: 'white',
    },
    card: {
        padding: 12,
        marginBottom: 12,
        backgroundColor: 'white',
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 16,
        margin: 16
    }
});