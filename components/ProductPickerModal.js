import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Modal,
  TextInput as RNTextInput,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import {
  TextInput,
  Checkbox,
  Button,
  Text,
  Surface,
  Divider,
  useTheme,
  Portal,
} from "react-native-paper";
import Fuse from "fuse.js";
import { faker } from "@faker-js/faker";
import { getProductForStore } from "../utils/fakeDataMethods";
import { ProductDisplayCompactMerchant } from "./ProductDisplayCompactMerchant";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {useStoreProduct} from "../api/hooks/useStoreProduct";
import {useStoreProducts} from "../api/hooks/useStoreProducts";
import {useSelector} from "react-redux";

// const initialProducts = faker.helpers.multiple(getProductForStore, { count: 100 });

const getUniqueProducts = (products) => {
  return [...new Set(products)];
};

const ProductPickerModal = ({ visible, onClose, onApply, name, existingSelectedProductIds }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(theme, insets);
  const {storeId} = useSelector((state) => state.store);
  const [uniqueProducts, setUniqueProducts] = useState([]);
  const {data: productsData} = useStoreProducts(storeId);
  // 🔹 Keep a stable ref for the input field to prevent focus loss
  const textInputRef = useRef(null);

  // 🔹 Prevent unnecessary re-renders of input
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (productsData) {
      setUniqueProducts(getUniqueProducts(productsData));
    }
  }, [productsData]);

  // console.log('uniqueP:', uniqueProducts);
  // 🔹 Fuse instance for searching products
  const fuse = useMemo(() => {
    return new Fuse(uniqueProducts, {
      keys: ["productName", "description", "collections", "tags", "attributes.*"],
      threshold: 0.4,
      includeScore: false,
      ignoreLocation: true,
    });
  }, [uniqueProducts]);

  // 🔹 Compute filtered products only when searchQuery changes
  const filteredProducts = useMemo(() => {
    return searchQuery.trim() ? fuse.search(searchQuery).map((res) => res.item) : uniqueProducts;
  }, [searchQuery, uniqueProducts, fuse]);

  const [selectedProductIds, setSelectedProductIds] = useState(existingSelectedProductIds || []);
  console.log('existingPIDs:', existingSelectedProductIds);
  console.log('selectedPIDs:', selectedProductIds);
  // 🔹 Stable function to prevent FlatList re-renders
  const toggleProductSelection = useCallback((productId) => {
    setSelectedProductIds((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  // console.log('filteredProds:', filteredProducts.map((p) => p.productId));

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
        (A, f) => A && selectedProductIds?.includes(f.productId),
        true,
    );
  };

  // 🔹 Memoize FlatList items
  const renderProductItem = useCallback(
      ({ item }) => (
          <TouchableWithoutFeedback>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View style={styles.productItem}>
            <View style={{ zIndex: 100, width: "90%", height: 100 }}>
              <ProductDisplayCompactMerchant product={item} cardMode={"contained"} />
            </View>
          </View>
            <Checkbox.Android
                status={selectedProductIds.includes(item.productId) ? "checked" : "unchecked"}
                onPress={() => toggleProductSelection(item.productId)}
            />
            </View>

          </TouchableWithoutFeedback>
      ),
      [selectedProductIds, toggleProductSelection]
  );

  return (
      <Portal>
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            onShow={() => textInputRef.current?.focus()} // 🔹 Ensure TextInput stays focused
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Surface style={styles.modalContainer}>
            {/* 🔹 Search Bar */}
            <Text variant={'titleMedium'} style={{marginVertical: 16}}>{`Select Products for ${name}`}</Text>
            <TextInput
                label="Search Products"
                // value={searchQuery}
                onBlur={Keyboard.dismiss}
                onChangeText={setSearchQuery}
                ref={textInputRef} // 🔹 Maintain input focus
                style={styles.searchBar}
                mode="outlined"
            />
            <View style={{display: 'flex', flexDirection: 'row', alignSelf:'center'}}>
              <Button mode={"text"} onPress={handleSelectAllFiltered}>
                {!allSelected() ? "Select All Results" : "Unselect All"}
              </Button>
            </View>
            {/* 🔹 Product List */}
            <FlatList
                data={filteredProducts}
                extraData={selectedProductIds}
                keyExtractor={(item) => item.productId}
                renderItem={renderProductItem}
                ItemSeparatorComponent={() => <Divider />}
                ListEmptyComponent={<Text style={styles.emptyText}>No Products Found</Text>}
                removeClippedSubviews={true} // 🔹 Optimize performance
                initialNumToRender={10} // 🔹 Render 10 items initially for better performance
                maxToRenderPerBatch={10} // 🔹 Limit batch rendering to reduce UI lag
            />

            {/* 🔹 Actions */}
            <View style={styles.actionContainer}>
              <Button mode="outlined" onPress={onClose}>
                Cancel
              </Button>
              <Button mode="contained" onPress={() => onApply(selectedProductIds)}>
                Apply
              </Button>
            </View>
          </Surface>
          </TouchableWithoutFeedback>
        </Modal>
      </Portal>
  );
};

const makeStyles = (theme, insets) =>
    StyleSheet.create({
      modalContainer: {
        height: "100%",
        paddingHorizontal: 16,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom,
        backgroundColor: theme.colors.surface,
      },
      searchBar: {
        marginBottom: 10,
        backgroundColor: "white",
      },
      productItem: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5,
        backgroundColor: "white",
        borderRadius: 8,
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