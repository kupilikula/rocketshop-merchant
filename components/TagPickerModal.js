import React, { useState } from "react";
import { Modal, View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Chip,
  Button,
  Text,
  Surface,
  useTheme,
} from "react-native-paper";
import {useProductTags} from "../api/hooks/useProductTags";
import {useSelector} from "react-redux";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const TagPickerModal = ({ visible, onClose, onApply, name, existingSelectedTags }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(theme, insets);
  const {storeId} = useSelector((state) => state.store);
  const {data: existingTags} = useProductTags(storeId);

  const [tags, setTags] = useState(existingTags || []);
  const [selectedTags, setSelectedTags] = useState(existingSelectedTags || []);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [newTag.trim(), ...prev]);
      toggleTagSelection(newTag.trim());
    }
    setNewTag("");
  };

  const toggleTagSelection = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Surface style={styles.modalContainer}>
          <Text variant={'titleMedium'} style={{marginVertical: 16}}>{`Select Product Tags for Offer ${name}`}</Text>
        {/* Tag Input */}
        <TextInput
          label="Add New Tag"
          value={newTag}
          onChangeText={setNewTag}
          onSubmitEditing={handleAddTag}
          style={styles.input}
          mode="outlined"
          right={<TextInput.Icon onPress={handleAddTag}  icon={'plus'}/>}
        />

        {/* Tag Chips */}
        <Text style={styles.sectionTitle}>Existing Tags</Text>
        <ScrollView contentContainerStyle={styles.chipsContainer}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              selected={(selectedTags || []).includes(tag)}
              onPress={() => toggleTagSelection(tag)}
              style={[
                styles.chip,
                  (selectedTags||[]).includes(tag) && styles.chipSelected,
              ]}
              textStyle={{
                color: (selectedTags || []).includes(tag) ? "white" : "black",
              }}
              selectedColor={"white"}
            >
              {tag}
            </Chip>
          ))}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <Button mode="outlined" onPress={onClose}>
            Cancel
          </Button>
          <Button mode="contained" onPress={() => onApply(selectedTags)}>
            Apply
          </Button>
        </View>
      </Surface>
    </Modal>
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
    input: {
      marginBottom: 20,
      backgroundColor: "white",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
    },
    chip: {
      margin: 5,
      backgroundColor: theme.colors.softSecondary,
    },
    chipSelected: {
      backgroundColor: theme.colors.secondary,
    },
    actionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
  });

export default TagPickerModal;
