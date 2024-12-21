import React, { useState, useMemo } from 'react';
import { FlatList, View, StyleSheet, Modal, Pressable } from 'react-native';
import { TextInput, Checkbox, Button, Text, Surface, Divider, useTheme } from 'react-native-paper';
import Fuse from 'fuse.js';
import { faker } from '@faker-js/faker';
import { getProductForStore } from '../utils/fakeDataMethods';
import {ProductDisplayCompactMerchant} from "./ProductDisplayCompactMerchant";

const initialProducts = faker.helpers.multiple(getProductForStore, { count: 100 });

const ProductPickerModal = ({ visible, onClose, onApply }) => {
    const theme = useTheme();
    const styles = makeStyles(theme);

    // State for product selection
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const fuse = useMemo(() => {
        return new Fuse(products, {
            keys: ['productName', 'description', 'collections', 'tags', 'attributes.*'],
            threshold: 0.4,
            includeScore: false,
            ignoreLocation: true,
        });
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            return searchResults.map((res) => res.item);
        }
        return products;
    }, [searchQuery, fuse]);

    const toggleProductSelection = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const renderProductItem = ({ item }) => (
        <View style={styles.productItem}>
            <View style={{ zIndex: 100, width:'90%', height: 100}}>
            <ProductDisplayCompactMerchant product={item} cardMode={'contained'}/>
            </View>
            <Checkbox.Android
                status={selectedProducts.includes(item.productId) ? 'checked' : 'unchecked'}
                onPress={() => toggleProductSelection(item.productId)}
            />

        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <Surface style={styles.modalContainer}>
                {/* Search Bar */}
                <TextInput
                    label="Search Products"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchBar}
                    mode="outlined"
                />

                {/* Product List */}
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.productId}
                    renderItem={renderProductItem}
                    ItemSeparatorComponent={() => <Divider />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No Products Found</Text>}
                />

                {/* Actions */}
                <View style={styles.actionContainer}>
                    <Button mode="outlined" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button mode="contained" onPress={() => onApply(selectedProducts)}>
                        Apply
                    </Button>
                </View>
            </Surface>
        </Modal>
    );
};

const makeStyles = (theme) =>
    StyleSheet.create({
        modalContainer: {
            flex: 1,
            padding: 10,
            backgroundColor: theme.colors.background,
        },
        searchBar: {
            marginBottom: 10,
            backgroundColor: 'white',
        },
        productItem: {
            position: 'relative',
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 5,
            backgroundColor: 'white'
            // paddingVertical: 10,
        },
        productText: {
            flex: 1,
            marginLeft: 10,
            fontSize: 16,
        },
        emptyText: {
            textAlign: 'center',
            marginVertical: 20,
            fontSize: 16,
            color: theme.colors.text,
        },
        actionContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
        },
    });

export default ProductPickerModal;
