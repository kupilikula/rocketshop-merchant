import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Chip, IconButton } from "react-native-paper";

const CollectionListItem = ({ collection, onEdit, onDelete, cardMode= 'elevated',showStatusChip= true, showEditIcon = true, showCheckbox = false }) => {
    const { collectionName, products, status, storeFrontDisplayNumberOfItems } = collection;

    return (
        <Card style={styles.card} mode={cardMode}>
            <View style={styles.container}>
                {/* Left Section */}
                <View style={styles.details}>
                    {/* Collection Name */}
                    <Text variant="titleLarge" style={styles.collectionName}>
                        {collectionName}
                    </Text>

                    {/* Number of Products */}
                    <Text variant="bodyMedium" style={styles.productCount}>
                        {products.length} products
                    </Text>

                    {/* Storefront Display */}
                    <Text variant="bodyMedium" style={styles.displayCount}>
                        Displaying {storeFrontDisplayNumberOfItems} on storefront
                    </Text>
                </View>

                {/* Right Section */}
                <View style={styles.rightSection}>
                    {/* Status Chip */}
                    {showStatusChip &&
                    <Chip
                        mode="flat"
                        style={[
                            styles.statusChip,
                            status === "Active" ? styles.activeChip : styles.inactiveChip,
                        ]}
                    >
                        {status}
                    </Chip>}

                    {/* Action Buttons */}
                    {showEditIcon &&
                    <View style={styles.actions}>
                        <IconButton
                            icon="pencil"
                            size={20}
                            onPress={onEdit}
                            style={styles.actionButton}
                        />
                    </View>}
                    {/*{showCheckbox &&*/}
                    {/*    <View style={styles.actions}>*/}
                    {/*        <IconButton*/}
                    {/*            icon="pencil"*/}
                    {/*            size={20}*/}
                    {/*            onPress={onEdit}*/}
                    {/*            style={styles.actionButton}*/}
                    {/*        />*/}
                    {/*    </View>}*/}
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'white'
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    details: {
        flex: 1,
    },
    collectionName: {
        fontWeight: "bold",
    },
    productCount: {
        color: "gray",
        marginTop: 4,
    },
    displayCount: {
        color: "gray",
        marginTop: 2,
    },
    rightSection: {
        alignItems: "flex-end",
    },
    statusChip: {
        marginBottom: 8,
    },
    activeChip: {
        backgroundColor: "#DFF6DD",
    },
    inactiveChip: {
        backgroundColor: "#FFE6E6",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    actionButton: {
        marginLeft: 4,
    },
});

export default CollectionListItem;
