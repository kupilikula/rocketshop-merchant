import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Modal as RNCoreModal, // Aliased react-native Modal for clarity
  useWindowDimensions,
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
  Modal as PaperModal, // Aliased react-native-paper Modal
} from "react-native-paper";
import Fuse from "fuse.js";
import { ProductDisplayCompactMerchant } from "./ProductDisplayCompactMerchant";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoreProducts } from "../api/hooks/useStoreProducts";
import { useSelector } from "react-redux";

const IS_WEB = Platform.OS === 'web';

const getUniqueProducts = (products) => {
  if (!products) return [];
  const unique = [];
  const map = new Map();
  for (const item of products) {
    if(item && item.productId && !map.has(item.productId)){
      map.set(item.productId, true);
      unique.push(item);
    }
  }
  return unique;
};

const ProductPickerModal = ({
                              visible,
                              onClose,
                              onApply,
                              name,
                              existingSelectedProductIds,
                              contentContainerStyle: contentContainerStyleFromParent // This is for Paper.Modal on web
                            }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const styles = makeStyles(theme, insets, IS_WEB, windowHeight);

  const {storeId} = useSelector((state) => state.store);
  const {data: productsData} = useStoreProducts(storeId);

  const [uniqueProductsState, setUniqueProductsState] = useState([]);
  const textInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (productsData) {
      setUniqueProductsState(getUniqueProducts(productsData));
    }
  }, [productsData]);

  const fuse = useMemo(() => {
    return new Fuse(uniqueProductsState, {
      keys: ["productName", "description", "collections.collectionName", "productTags", "attributes.value"],
      threshold: 0.4,
      includeScore: false,
      ignoreLocation: true,
    });
  }, [uniqueProductsState]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return uniqueProductsState;
    if (!fuse) return uniqueProductsState;
    return fuse.search(searchQuery).map((res) => res.item);
  }, [searchQuery, uniqueProductsState, fuse]);

  const [selectedProductIds, setSelectedProductIds] = useState([]);

  useEffect(() => {
    if (visible) {
      setSelectedProductIds(existingSelectedProductIds || []);
    }
    // Focus logic (conditional)
    if (visible && textInputRef.current) {
      if (IS_WEB) { // For Paper.Modal on web
        setTimeout(() => textInputRef.current?.focus(), 100);
      } else {
        // For RN Core Modal, focus is handled by onShow if needed (already in original)
        // but if onShow isn't directly focusing, this can also be tried.
        // setTimeout(() => textInputRef.current?.focus(), 100);
      }
    }
  }, [visible, existingSelectedProductIds]);


  const toggleProductSelection = useCallback((productId) => {
    setSelectedProductIds((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const allFilteredCurrentlySelected = useMemo(() => {
    if (filteredProducts.length === 0) return false;
    return filteredProducts.every(p => selectedProductIds.includes(p.productId));
  }, [filteredProducts, selectedProductIds]);

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map(p => p.productId);
    if (allFilteredCurrentlySelected) {
      setSelectedProductIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedProductIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const renderProductItem = useCallback(
      ({ item }) => (
          <View style={styles.productItemOuter}>
            <View style={styles.productItemInner}>
              <ProductDisplayCompactMerchant product={item} cardMode={"outlined"} />
            </View>
            <Checkbox.Android
                status={selectedProductIds.includes(item.productId) ? "checked" : "unchecked"}
                onPress={() => toggleProductSelection(item.productId)}
                color={theme.colors.primary}
            />
          </View>
      ),
      [selectedProductIds, toggleProductSelection, styles, theme.colors.primary]
  );

  // This is the common JSX for the *content* of the modal
  const modalActualContent = (
        <Surface mode={'contained'} style={IS_WEB ? styles.modalInnerSurfaceForWeb : styles.modalContainerForMobile}>
          <Text variant={'titleMedium'} style={styles.modalTitle}>
            {`Select Products for "${name}"`}
          </Text>
          <TextInput
              label="Search Products"
              value={searchQuery}
              onChangeText={setSearchQuery}
              ref={textInputRef}
              style={styles.searchBar}
              mode="outlined"
              dense
              left={<TextInput.Icon icon="magnify" />}
          />
          <View style={styles.selectAllButtonContainer}>
            <Button
                mode="text"
                onPress={handleSelectAllFiltered}
                disabled={filteredProducts.length === 0}
                icon={allFilteredCurrentlySelected ? "checkbox-marked" : "checkbox-blank-outline"}
            >
              {allFilteredCurrentlySelected ? "Deselect All Filtered Products" : "Select All Filtered Products"}
            </Button>
          </View>

          <FlatList
              data={filteredProducts}
              extraData={selectedProductIds}
              keyExtractor={(item) => item.productId}
              renderItem={renderProductItem}
              ItemSeparatorComponent={() => <Divider style={styles.divider}/>}
              ListEmptyComponent={<Text style={styles.emptyText}>No products match your search.</Text>}
              removeClippedSubviews={true}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              style={styles.flatListStyle}
              contentContainerStyle={styles.flatListContentContainer}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={IS_WEB ? undefined : Keyboard.dismiss}
          />

          <View style={styles.actionContainer}>
            <Button mode="outlined" onPress={onClose} style={styles.actionButton}>
              Cancel
            </Button>
            <Button mode="contained" onPress={() => onApply(selectedProductIds)} style={styles.actionButton}>
              Apply Selections
            </Button>
          </View>
        </Surface>
  );

  if (IS_WEB) {
    return (
        <Portal>
          <PaperModal // Use Paper.Modal for Web
              visible={visible}
              onDismiss={onClose}
              contentContainerStyle={[styles.modalContentBoxWeb, contentContainerStyleFromParent]}
          >
            {modalActualContent}
          </PaperModal>
        </Portal>
    );
  } else { // Mobile - use original RNCoreModal
    return (
        <Portal> {/* Keep Portal if it was part of original structure for RN.Modal */}
          <RNCoreModal
              visible={visible}
              animationType="slide" // Original prop
              onRequestClose={onClose} // Original prop for RN.Modal
              onShow={() => { // Original onShow for RN.Modal focus
                if (textInputRef.current) {
                  textInputRef.current.focus();
                }
              }}
              transparent={false} // Typically false for full screen take-over modals
          >
            {modalActualContent}
          </RNCoreModal>
        </Portal>
    );
  }
};

const makeStyles = (theme, insets, isWeb, windowHeightParam) =>
    StyleSheet.create({
      // --- Styles for Mobile (using react-native's Modal) ---
      modalContainerForMobile: { // Applied to the Surface inside react-native's Modal
        height: "100%",         // Original full height for mobile
        paddingHorizontal: 16,  // Original
        paddingTop: insets.top + 16, // Original
        paddingBottom: insets.bottom,  // Original (use insets.bottom instead of insets.bottom + 16 if too much)
        backgroundColor: theme.colors.surface, // Original
        flex: 1,                // Ensure it's a flex container for its children
        flexDirection: 'column',// Stack children vertically
      },

      // --- Styles for Web (using react-native-paper's Modal) ---
      modalContentBoxWeb: { // Applied to Paper.Modal's contentContainerStyle
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
        maxHeight: '85vh',
        // width is controlled by contentContainerStyleFromParent from OfferDetailsScreen for web
        // Fallback width if contentContainerStyleFromParent doesn't specify one (though it should for web)
        width: 'auto', // Let content or parent prop dictate width
        minWidth: 300, // Ensure it doesn't get too small
        alignSelf: 'center',
        borderRadius: theme.roundness * 2,
        elevation: 5,
        overflow: 'hidden',
        display: 'flex',        // Ensure this container itself is a flex container
        flexDirection: 'column',// Its children (modalInnerSurfaceForWeb) will stack vertically
      },
      modalInnerSurfaceForWeb: { // Applied to the Surface inside Paper.Modal on Web
        flex: 1,        // Make Surface fill the modalContentBoxWeb (respecting maxHeight)
        flexShrink: 1,  // Allow it to shrink if content is smaller
        backgroundColor: 'transparent',
        flexDirection: 'column',
      },

      // --- Common Styles for Modal Content (used by modalActualContent) ---
      modalTitle: {
        marginBottom: 16,
        textAlign: IS_WEB ? 'left' : 'center',
        fontWeight: 'bold',
        paddingHorizontal: IS_WEB ? 0 : 8,
      },
      searchBar: {
        marginBottom: 8,
        backgroundColor: theme.colors.background,
      },
      selectAllButtonContainer: {
        flexDirection: 'row',
        marginBottom: 8,
      },
      flatListStyle: {
        flex: 1,
        flexShrink: 1, // Important for it to work within a flex parent with other elements
      },
      flatListContentContainer: {
        paddingBottom: 10,
      },
      productItemOuter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
      },
      productItemInner: {
        flex: 1,
        marginRight: 8,
      },
      divider: {
        height: 1,
        backgroundColor: theme.colors.outlineVariant,
      },
      emptyText: {
        textAlign: "center",
        marginVertical: 30,
        fontSize: 16,
        color: theme.colors.onSurfaceVariant,
      },
      actionContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: theme.colors.outlineVariant,
      },
      actionButton: {
        marginLeft: 8,
      }
    });

export default ProductPickerModal;