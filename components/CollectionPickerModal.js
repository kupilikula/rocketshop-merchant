import React, { useState, useMemo } from 'react';
import { FlatList, View, StyleSheet, Modal, Pressable } from 'react-native';
import { TextInput, Checkbox, Button, Text, Surface, Divider, useTheme } from 'react-native-paper';
import Fuse from 'fuse.js';
import { faker } from '@faker-js/faker';
import {getCollection, getProductForStore} from '../utils/fakeDataMethods';
import {ProductDisplayCompactMerchant} from "./ProductDisplayCompactMerchant";
import CollectionListItem from "./CollectionListItem";

const initialCollections = faker.helpers.multiple(getCollection, { count: 10 });

const CollectionPickerModal = ({ visible, onClose, onApply }) => {
    const theme = useTheme();
    const styles = makeStyles(theme);

    // State for product selection
    const [collections, setCollections] = useState(initialCollections);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollections, setSelectedCollections] = useState([]);
    const fuse = useMemo(() => {
        return new Fuse(collections, {
            keys: ['collectionName'],
            threshold: 0.4,
            includeScore: false,
            ignoreLocation: true,
        });
    }, [collections]);

    const filteredCollections = useMemo(() => {
        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            return searchResults.map((res) => res.item);
        }
        return collections;
    }, [searchQuery, fuse]);

    const toggleCollectionSelection = (collectionId) => {
        setSelectedCollections((prev) =>
            prev.includes(collectionId)
                ? prev.filter((id) => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    const renderCollectionItem = ({ item }) => (
        <View style={styles.collectionItem}>
            <View style={{ zIndex: 100, width:'90%'}}>
            <CollectionListItem collection={item} cardMode={'contained'} showStatusChip={true} showEditIcon={false}/>
            </View>
            <Checkbox.Android
                status={selectedCollections.includes(item.collectionId) ? 'checked' : 'unchecked'}
                onPress={() => toggleCollectionSelection(item.collectionId)}
            />

        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <Surface style={styles.modalContainer}>
                {/* Search Bar */}
                <TextInput
                    label="Search Collections"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchBar}
                    mode="outlined"
                />

                {/* Product List */}
                <FlatList
                    data={filteredCollections}
                    keyExtractor={(item) => item.collectionId}
                    renderItem={renderCollectionItem}
                    ItemSeparatorComponent={() => <Divider />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No Collections Found</Text>}
                />

                {/* Actions */}
                <View style={styles.actionContainer}>
                    <Button mode="outlined" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button mode="contained" onPress={() => onApply(selectedCollections)}>
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
        collectionItem: {
            position: 'relative',
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 5,
            backgroundColor: 'white'
            // paddingVertical: 10,
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

export default CollectionPickerModal;
