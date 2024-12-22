import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Chip, useTheme } from "react-native-paper";

const CollectionListItem = ({
  collection,
  onDelete,
  cardMode = "elevated",
  showStatusChip = true,
  showEditIcon = true,
  showCheckbox = false,
}) => {
  const {
    collectionName,
    products,
    isActive,
    storeFrontDisplay,
    storeFrontDisplayNumberOfItems,
  } = collection;
  const theme = useTheme();
  const styles = makeStyles(theme);
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
            {storeFrontDisplay
              ? "Displaying " +
                storeFrontDisplayNumberOfItems.toString() +
                " on storefront"
              : ""}
          </Text>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {/* Status Chip */}
          {showStatusChip && (
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                isActive ? styles.activeChip : styles.inactiveChip,
              ]}
            >
              {isActive ? "Active" : "Inactive"}
            </Chip>
          )}

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

const makeStyles = (theme) =>
  StyleSheet.create({
    card: {
      margin: 8,
      padding: 8,
      borderRadius: 8,
      backgroundColor: "white",
    },
    container: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    details: {
      flex: 1,
    },
    collectionName: {
      fontWeight: "bold",
    },
    productCount: {
      color: theme.colors.text,
      marginTop: 4,
    },
    displayCount: {
      color: theme.colors.text,
      marginTop: 2,
    },
    rightSection: {
      alignItems: "flex-end",
    },
    statusChip: {
      marginBottom: 8,
    },
    activeChip: {
      backgroundColor: theme.colors.active,
    },
    inactiveChip: {
      backgroundColor: theme.colors.inactive,
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
