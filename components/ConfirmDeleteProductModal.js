import React, { useState } from "react";
import {View, StyleSheet, Alert, TextInput} from "react-native";
import { Text, Button, Modal, Portal, useTheme, ActivityIndicator} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../api/client";
import OtpInput from "../components/OtpInput";
import { useQueryClient } from "react-query";
import {setStore} from "../store/storeSlice";
import {useDeleteProduct} from "../api/hooks/useDeleteProduct";
import {useRouter} from "expo-router";

export default function ConfirmDeleteProductModal({ visible, onDismiss, productId }) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const router = useRouter();
    const dispatch = useDispatch();
    const store = useSelector((state) => state.store);
    const { mutateAsync: deleteProduct, isLoading, error } = useDeleteProduct();


    const handleDeleteProduct = async () => {
        try {
            await deleteProduct({ productId, storeId: store.storeId });

            Alert.alert("Success", "Product has been deleted.");
            onDismiss();

            // 🚨 First navigate
            router.replace('/Main/(tabs)/Products');

            // 🚨 Then after small delay, invalidate
            setTimeout(() => {
                queryClient.invalidateQueries(["storeProducts", store.storeId]);
                queryClient.invalidateQueries(["merchantProduct", store.storeId, productId]);
            }, 300); // small delay (~300ms) to let router replace
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to delete product.");
        }
    };

    const handleCancel = () => {
        onDismiss();
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={handleCancel} contentContainerStyle={styles.modal}>
                <View>
                {isLoading &&
                <View>
                    <Text variant={'titleMedium'} style={{alignSelf: 'center'}}>Deleting Product...</Text>
                    <ActivityIndicator size="small" animating={true} color={theme.colors.primary}/>
                </View>
                }
                {!isLoading &&
                    <View>
                <Text variant="titleMedium" style={{ marginBottom: 16, textAlign: "center" }}>
                    Are You Sure You Want To Delete This Product?
                </Text>

                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',alignSelf: 'center', }}>

                            <View style={{display: 'flex', alignSelf: 'center'}}>
                            <Button
                                mode="outlined"
                                onPress={handleCancel}
                                style={{marginRight: 8, borderRadius: 8, borderColor: theme.colors.primary }}
                            >
                                Cancel
                            </Button>
                            </View>
                            <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center'}}>
                        <Button mode="contained" style={{backgroundColor: theme.colors.error, borderRadius: 8}} labelStyle={{color: 'white'}} onPress={() => handleDeleteProduct()}>
                            Yes, Delete Product
                        </Button>
                            </View>

                        </View>
                    </View>
                }
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 24,
        padding: 16,
        backgroundColor: "white",
        borderRadius: 8,
    },
});