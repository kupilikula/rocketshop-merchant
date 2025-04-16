import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme, Surface, Switch } from 'react-native-paper';
import ProductPickerModal from './ProductPickerModal';
import CollectionPickerModal from './CollectionPickerModal';
import TagPickerModal from './TagPickerModal';

const ApplicableToSection = ({ applicableTo, onUpdate, ruleName }) => {
    const theme = useTheme();
    const [productPickerVisible, setProductPickerVisible] = useState(false);
    const [collectionPickerVisible, setCollectionPickerVisible] = useState(false);
    const [tagPickerVisible, setTagPickerVisible] = useState(false);
    console.log('applicableTo:', applicableTo);
    const handleStoreWideToggle = (value) => {
        onUpdate({
            ...applicableTo,
            storeWide: value,
            // If storeWide is true, clear other selections
            ...(value && {
                productIds: [],
                collectionIds: [],
                productTags: [],
            }),
        });
    };

    const handleApplyProducts = (products) => {
        onUpdate({
            ...applicableTo,
            storeWide: false,
            productIds: products,
        });
        setProductPickerVisible(false);
    };

    const handleApplyCollections = (collections) => {
        onUpdate({
            ...applicableTo,
            storeWide: false,
            collectionIds: collections,
        });
        setCollectionPickerVisible(false);
    };

    const handleApplyTags = (tags) => {
        onUpdate({
            ...applicableTo,
            storeWide: false,
            productTags: tags,
        });
        setTagPickerVisible(false);
    };

    return (
        <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
                Applicable To
            </Text>

            <View style={styles.storeWideContainer}>
                <Text style={{marginRight: 10}} variant={"bodyLarge"}>Apply Store Wide</Text>
                <Switch
                    value={applicableTo.storeWide}
                    onValueChange={handleStoreWideToggle}
                    color={theme.colors.success}
                />
            </View>

            {!applicableTo.storeWide && (
                <>
                    <View style={styles.optionContainer}>
                        <Button
                            mode="outlined"
                            onPress={() => setProductPickerVisible(true)}
                            style={styles.button}
                        >
                            Select Products
                        </Button>
                        {applicableTo.productIds?.length > 0 && (
                            <Text style={styles.selectionText}>
                                {`${applicableTo.productIds.length} products selected`}
                            </Text>
                        )}
                    </View>

                    <View style={styles.optionContainer}>
                        <Button
                            mode="outlined"
                            onPress={() => setCollectionPickerVisible(true)}
                            style={styles.button}
                        >
                            Select Collections
                        </Button>
                        {applicableTo.collectionIds?.length > 0 && (
                            <Text style={styles.selectionText}>
                                {`${applicableTo.collectionIds.length} collections selected`}
                            </Text>
                        )}
                    </View>

                    <View style={styles.optionContainer}>
                        <Button
                            mode="outlined"
                            onPress={() => setTagPickerVisible(true)}
                            style={styles.button}
                        >
                            Select Tags
                        </Button>
                        {applicableTo.productTags?.length > 0 && (
                            <Text style={styles.selectionText}>
                                {`${applicableTo.productTags.length} tags selected`}
                            </Text>
                        )}
                    </View>
                </>
            )}

            <ProductPickerModal
                visible={productPickerVisible}
                onClose={() => setProductPickerVisible(false)}
                onApply={handleApplyProducts}
                name={ruleName}
                existingSelectedProductIds={applicableTo.productIds || []}
            />

            <CollectionPickerModal
                visible={collectionPickerVisible}
                onClose={() => setCollectionPickerVisible(false)}
                onApply={handleApplyCollections}
                name={ruleName}
                existingSelectedCollectionIds={applicableTo.collectionIds || []}
            />

            <TagPickerModal
                visible={tagPickerVisible}
                onClose={() => setTagPickerVisible(false)}
                onApply={handleApplyTags}
                name={ruleName}
                existingSelectedTags={applicableTo.productTags || []}
            />
        </Surface>
    );
};

const styles = StyleSheet.create({
    section: {
        marginVertical: 16,
        // padding: 16,
        borderRadius: 8,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    storeWideContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 16,
    },
    optionContainer: {
        marginVertical: 8,
    },
    button: {
        marginVertical: 4,
    },
    selectionText: {
        marginTop: 4,
        marginLeft: 8,
        color: 'gray',
    },
});

export default ApplicableToSection;