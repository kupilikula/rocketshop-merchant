import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Modal as RNCoreModal, // Import react-native Modal for mobile
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
  Modal as PaperModal, // Import Paper.Modal for web
} from "react-native-paper";
import Fuse from "fuse.js";
import CollectionListItem from "./CollectionListItem"; // Assuming path is correct
import {useCollections} from "../api/hooks/useCollections"; // Assuming path is correct
import {useSelector} from "react-redux";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const IS_WEB = Platform.OS === 'web';

const CollectionPickerModal = ({
                                 visible,
                                 onClose,
                                 onApply,
                                 name,
                                 existingSelectedCollectionIds,
                                 contentContainerStyle: contentContainerStyleFromParent // For Paper.Modal on web
                               }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const styles = makeStyles(theme, insets, IS_WEB, windowHeight);

  const {storeId} = useSelector((state) => state.store);
  const {data: fetchedCollections = []} = useCollections(storeId);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);

  // Initialize selectedCollectionIds when modal becomes visible or existing IDs change
  useEffect(() => {
    if (visible) {
      setSelectedCollectionIds(existingSelectedCollectionIds || []);
    }
  }, [visible, existingSelectedCollectionIds]);

  const fuse = useMemo(() => {
    if (!fetchedCollections) return null;
    return new Fuse(fetchedCollections, {
      keys: ["collectionName"],
      threshold: 0.4,
      includeScore: false,
      ignoreLocation: true,
    });
  }, [fetchedCollections]);

  const filteredCollections = useMemo(() => {
    if (!fetchedCollections) return [];
    if (searchQuery.trim() && fuse) {
      const searchResults = fuse.search(searchQuery);
      return searchResults.map((res) => res.item);
    }
    return fetchedCollections;
  }, [searchQuery, fuse, fetchedCollections]);

  const toggleCollectionSelection = useCallback((collectionId) => {
    setSelectedCollectionIds((prev) =>
        prev.includes(collectionId)
            ? prev.filter((id) => id !== collectionId)
            : [...prev, collectionId]
    );
  }, []);

  const allFilteredCurrentlySelected = useMemo(() => {
    if (!filteredCollections || filteredCollections.length === 0) return false;
    return filteredCollections.every(c => selectedCollectionIds.includes(c.collectionId));
  }, [filteredCollections, selectedCollectionIds]);

  const handleSelectAllFiltered = () => {
    const filteredIds = (filteredCollections || []).map(c => c.collectionId);
    if (allFilteredCurrentlySelected) {
      setSelectedCollectionIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedCollectionIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const renderCollectionItem = useCallback(({ item }) => (
      <View style={styles.collectionItemRow}>
        <View style={styles.collectionItemContent}>
          <CollectionListItem
              collection={item}
              cardMode={"elevated"}
              showStatusChip={true}
              showEditIcon={false}
          />
        </View>
        <Checkbox.Android
            status={selectedCollectionIds.includes(item.collectionId) ? "checked" : "unchecked"}
            onPress={() => toggleCollectionSelection(item.collectionId)}
            color={theme.colors.primary}
        />
      </View>
  ), [selectedCollectionIds, toggleCollectionSelection, styles, theme.colors.primary]);

  const modalActualContent = (
      <Surface mode={'contained'} style={IS_WEB ? styles.modalInnerSurfaceWeb : styles.modalContainerMobile}>
        <Text variant={'titleMedium'} style={styles.modalTitle}>
          {`Select Collections for "${name}"`}
        </Text>
        <TextInput
            label="Search Collections"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            mode="outlined"
            dense
            left={<TextInput.Icon icon="magnify" />}
        />
        <View style={styles.selectAllButtonContainer}>
          <Button
              mode="text"
              onPress={handleSelectAllFiltered}
              disabled={!filteredCollections || filteredCollections.length === 0}
              icon={allFilteredCurrentlySelected ? "checkbox-marked" : "checkbox-blank-outline"}
          >
            {allFilteredCurrentlySelected ? "Deselect All Filtered Collections" : "Select All Filtered Collections"}
          </Button>
        </View>
        <FlatList
            data={filteredCollections || []}
            keyExtractor={(item) => item.collectionId}
            renderItem={renderCollectionItem}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No collections match your search.</Text>
            }
            style={styles.flatListStyle}
            contentContainerStyle={styles.flatListContentContainer}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={IS_WEB ? undefined : Keyboard.dismiss}
        />
        <View style={styles.actionContainer}>
          <Button mode="outlined" onPress={onClose} style={styles.actionButton}>
            Cancel
          </Button>
          <Button mode="contained" onPress={() => onApply(selectedCollectionIds)} style={styles.actionButton}>
            Apply Selections
          </Button>
        </View>
      </Surface>
  );

  if (IS_WEB) {
    return (
        <Portal>
          <PaperModal
              visible={visible}
              onDismiss={onClose}
              contentContainerStyle={[styles.modalContentBoxWeb, contentContainerStyleFromParent]}
          >
              {modalActualContent}
          </PaperModal>
        </Portal>
    );
  } else { // Mobile: Use react-native's Modal
    return (
        <Portal>
          <RNCoreModal
              visible={visible}
              animationType="slide" // Original RN.Modal prop
              onRequestClose={onClose} // Original RN.Modal prop
              transparent={false} // Common for RN modals
          >
              {modalActualContent}
          </RNCoreModal>
        </Portal>
    );
  }
};

const makeStyles = (theme, insets, isWeb, windowHeightParam) =>
    StyleSheet.create({
      // --- Style for Mobile (content of react-native's Modal) ---
      modalContainerMobile: { // Applied to the Surface inside RNCoreModal
        height: "100%",         // Takes full height of RNCoreModal
        paddingHorizontal: 16,  // Original paddingHorizontal
        paddingTop: insets.top, // Original was commented out, respecting that. Add if needed.
        paddingBottom: insets.bottom, // Original paddingBottom
        backgroundColor: theme.colors.surface, // Original backgroundColor
        flex: 1,                // Ensure it's a flex container
        flexDirection: 'column',// Stack children vertically
      },

      // --- Styles for Web (using react-native-paper's Modal) ---
      modalContentBoxWeb: { // For Paper.Modal's contentContainerStyle (the box)
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
        maxHeight: '85vh',
        // width comes from contentContainerStyleFromParent for web
        width: 'auto',
        minWidth: 300,
        alignSelf: 'center',
        borderRadius: theme.roundness * 2,
        elevation: 5, // Or theme.elevation.level3
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      },
      modalInnerSurfaceWeb: { // For the Surface *inside* Paper.Modal on Web
        flex: 1,        // Make Surface fill the modalContentBoxWeb
        flexShrink: 1,  // Allow it to shrink if content is smaller
        backgroundColor: 'transparent',
        flexDirection: 'column',
      },

      // --- Common Styles for Modal's Internal Content ---
      modalTitle: {
        marginBottom: 16,
        textAlign: isWeb ? 'left' : 'center',
        fontWeight: 'bold',
        paddingHorizontal: isWeb ? 0 : 8,
      },
      searchBar: { // Original style, but ensure it has a background for web if surface is transparent
        marginBottom: 8, // Reduced
        backgroundColor: theme.colors.background, // theme.colors.white in original
      },
      selectAllButtonContainer: {
        flexDirection: 'row',
        marginBottom: 8,
      },
      collectionItemRow: { // Original collectionItem style (renamed for clarity)
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5,
        // backgroundColor: "white", // CollectionListItem will provide its own BG
        paddingRight: 8, // To give space for checkbox
      },
      collectionItemContent: { // Wrapper for CollectionListItem
        flex: 1,
        marginRight: 8,
      },
      emptyText: { // Original style
        textAlign: "center",
        marginVertical: 20,
        fontSize: 16,
        color: theme.colors.onSurfaceVariant, // Themed
      },
      actionContainer: { // Original style
        flexDirection: "row",
        justifyContent: "flex-end", // Changed to flex-end
        marginTop: 10, // Original
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: theme.colors.outlineVariant,
      },
      actionButton: { // Added for consistency
        marginLeft: 8,
      },
      flatListStyle: {
        flex: 1,
        flexShrink: 1,
      },
      flatListContentContainer: {
        paddingBottom: 10,
      },
      divider: {
        height: 1,
        backgroundColor: theme.colors.outlineVariant,
      },
    });

export default CollectionPickerModal;