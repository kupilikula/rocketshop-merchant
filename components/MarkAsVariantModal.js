import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Modal, Portal, Text, Button, useTheme } from "react-native-paper";
import ProductSearch from "./ProductSearch";
import {useStoreProducts} from "../api/hooks/useStoreProducts";
import {useSelector} from "react-redux";
import {SearchResultProduct} from "./SearchResultProduct"; // Your existing search component

export default function MarkAsVariantModal({
                                               visible,
                                               onClose,
                                               onProductSelect,
                                           }) {
    const theme = useTheme();
    const {storeId} = useSelector((state) => state.store);
    const { data: uniqueProducts, isLoading, isError } = useStoreProducts(storeId);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleConfirm = () => {
        if (selectedProduct) {
            onProductSelect(selectedProduct); // Pass the selected product to the parent
        } else {
            alert("Please select a product to mark as a variant.");
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.modalContainer}
            >
                <Text style={styles.title}>Select a Product to Mark as Variant</Text>
                {
                    selectedProduct &&
                    <>
                    <Text variant={'titleMedium'}>Current Selection</Text>
                    <View style={{backgroundColor: theme.colors.softSuccess, width: '100%', borderRadius: 8, marginVertical: 10, padding: 8}}>
                    <SearchResultProduct
                        product={selectedProduct}
                        withCheckBox={false}
                        onPressHandler={() =>{}}
                    />
                    </View>
                    </>
                }
                <></>
                <ProductSearch
                    uniqueProducts={uniqueProducts}
                    onSearchResultPressHandler={(product) => setSelectedProduct(product)}
                    style={{}}
                />
                <View style={styles.buttonsContainer}>
                    <Button
                        mode="outlined"
                        onPress={onClose}
                        style={styles.button}
                        textColor={theme.colors.error}
                    >
                        Cancel
                    </Button>
                    <Button mode="contained" onPress={handleConfirm} style={styles.button}>
                        Confirm
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: "white",
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // paddingHorizontal: 10,
        flex: 1,
        // height: "100%",
        // width: "100%",
        // width: '100%'
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    button: {
        flex: 1,
        marginHorizontal: 8,
    },
});