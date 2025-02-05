import React, { useState, useMemo } from "react";
import {FlatList, View, StyleSheet, Modal, Keyboard, TouchableWithoutFeedback} from "react-native";
import {
  TextInput,
  Checkbox,
  Button,
  Text,
  Surface,
  Divider,
  useTheme, Portal,
} from "react-native-paper";
import Fuse from "fuse.js";
import { faker } from "@faker-js/faker";
import { getCollection } from "../utils/fakeDataMethods";
import CollectionListItem from "./CollectionListItem";
import {useCollections} from "../api/hooks/useCollections";
import {useSelector} from "react-redux";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const initialCollections = faker.helpers.multiple(getCollection, { count: 10 });

const CollectionPickerModal = ({ visible, onClose, onApply, offerName, existingSelectedCollectionIds }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(theme, insets);
  const {storeId} = useSelector((state) => state.store);
  // State for product selection
  // const [collections, setCollections] = useState(initialCollections);
  const {data: collections} = useCollections(storeId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState(existingSelectedCollectionIds);
  const fuse = useMemo(() => {
    return new Fuse(collections, {
      keys: ["collectionName"],
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
  }, [searchQuery, fuse, collections]);

  const toggleCollectionSelection = (collectionId) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId],
    );
  };

  const allSelected = () => {
    return filteredCollections?.reduce(
      (A, f) => A && selectedCollectionIds?.includes(f.collectionId),
      true,
    );
  };
  const handleSelectAllFiltered = () => {
    console.log("selectedP:", selectedCollectionIds);
    // console.log('filP:', filteredProducts);
    if (allSelected()) {
      let newList = selectedCollectionIds.filter(
        (id) => !filteredCollections.map((p) => p.collectionId).includes(id),
      );
      console.log("newList:", newList);
      setSelectedCollectionIds(newList);
    } else {
      let unique = [
        ...new Set([
          ...selectedCollectionIds,
          ...filteredCollections.map((c) => c.collectionId),
        ]),
      ];
      setSelectedCollectionIds(unique);
    }
  };

  const renderCollectionItem = ({ item }) => (
      <TouchableWithoutFeedback>
    <View style={styles.collectionItem}>
      <View style={{ zIndex: 100, width: "90%" }}>
        <CollectionListItem
          collection={item}
          cardMode={"contained"}
          showStatusChip={true}
          showEditIcon={false}
        />
      </View>
      <Checkbox.Android
        status={
          selectedCollectionIds?.includes(item.collectionId)
            ? "checked"
            : "unchecked"
        }
        onPress={() => toggleCollectionSelection(item.collectionId)}
      />
    </View>
      </TouchableWithoutFeedback>
  );

  return (
      <Portal>
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Surface style={styles.modalContainer}>
        <Text variant={'titleMedium'} style={{marginVertical: 16}}>{`Select Collections for Offer ${offerName}`}</Text>
        {/* Search Bar */}
        <TextInput
          label="Search Collections"
          // value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
          mode="outlined"
        />
        <View style={{display: 'flex', flexDirection: 'row', alignSelf:'center'}}>
          <Button mode={"outlined"} onPress={handleSelectAllFiltered}>
            {!allSelected() ? "Select All Results" : "Unselect All Results"}
          </Button>
        </View>
        {/* Product List */}
        <FlatList
          data={filteredCollections}
          keyExtractor={(item) => item.collectionId}
          renderItem={renderCollectionItem}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Collections Found</Text>
          }
        />

        {/* Actions */}
        <View style={styles.actionContainer}>
          <Button mode="outlined" onPress={onClose}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={() => onApply(selectedCollectionIds)}
          >
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
    collectionItem: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 5,
      backgroundColor: "white",
      // paddingVertical: 10,
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

export default CollectionPickerModal;
