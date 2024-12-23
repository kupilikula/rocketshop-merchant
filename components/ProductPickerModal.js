import React, { useState, useMemo } from "react";
import { FlatList, View, StyleSheet, Modal } from "react-native";
import {
  TextInput,
  Checkbox,
  Button,
  Text,
  Surface,
  Divider,
  useTheme,
} from "react-native-paper";
import Fuse from "fuse.js";
import { faker } from "@faker-js/faker";
import { getProductForStore } from "../utils/fakeDataMethods";
import { ProductDisplayCompactMerchant } from "./ProductDisplayCompactMerchant";

const initialProducts = faker.helpers.multiple(getProductForStore, {
  count: 100,
});

const ProductPickerModal = ({ visible, onClose, onApply }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  // State for product selection
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: [
        "productName",
        "description",
        "collections",
        "tags",
        "attributes.*",
      ],
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
  }, [searchQuery, fuse, products]);

  const toggleProductSelection = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <View style={{ zIndex: 100, width: "90%", height: 100 }}>
        <ProductDisplayCompactMerchant product={item} cardMode={"contained"} />
      </View>
      <Checkbox.Android
        status={
          selectedProductIds.includes(item.productId) ? "checked" : "unchecked"
        }
        onPress={() => toggleProductSelection(item.productId)}
      />
    </View>
  );

  const handleSelectAllFiltered = () => {
    if (allSelected()) {
      let newList = selectedProductIds.filter(
        (id) => !filteredProducts.map((p) => p.productId).includes(id),
      );
      console.log("newList:", newList);
      setSelectedProductIds(newList);
    } else {
      let unique = [
        ...new Set([
          ...selectedProductIds,
          ...filteredProducts.map((p) => p.productId),
        ]),
      ];
      setSelectedProductIds(unique);
    }
  };

  const allSelected = () => {
    return filteredProducts.reduce(
      (A, f) => A && selectedProductIds.includes(f.productId),
      true,
    );
  };

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

        <View>
          <Button mode={"text"} onPress={handleSelectAllFiltered}>
            {!allSelected() ? "Select All Results" : "Unselect All"}
          </Button>
        </View>
        {/* Product List */}
        <FlatList
          data={filteredProducts}
          extraData={selectedProductIds}
          keyExtractor={(item) => item.productId}
          renderItem={renderProductItem}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Products Found</Text>
          }
        />

        {/* Actions */}
        <View style={styles.actionContainer}>
          <Button mode="outlined" onPress={onClose}>
            Cancel
          </Button>
          <Button mode="contained" onPress={() => onApply(selectedProductIds)}>
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
      backgroundColor: "white",
    },
    productItem: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 5,
      backgroundColor: "white",
      borderRadius: 8,
      // paddingVertical: 10,
    },
    productText: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
    },
    emptyText: {
      textAlign: "center",
      marginVertical: 20,
      fontSize: 16,
      color: theme.colors.text,
    },
    actionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
  });

export default ProductPickerModal;
