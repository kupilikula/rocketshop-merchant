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

const TagPickerModal = ({ visible, existingTags, onClose, onApply }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  const [tags, setTags] = useState(existingTags || []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
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
        {/* Tag Input */}
        <TextInput
          label="Add New Tag"
          value={newTag}
          onChangeText={setNewTag}
          onSubmitEditing={handleAddTag}
          style={styles.input}
          mode="outlined"
          right={<TextInput.Icon name="plus" onPress={handleAddTag} />}
        />

        {/* Tag Chips */}
        <Text style={styles.sectionTitle}>Existing Tags</Text>
        <ScrollView contentContainerStyle={styles.chipsContainer}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              selected={selectedTags.includes(tag)}
              onPress={() => toggleTagSelection(tag)}
              style={[
                styles.chip,
                selectedTags.includes(tag) && styles.chipSelected,
              ]}
              textStyle={{
                color: selectedTags.includes(tag) ? "white" : "black",
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

const makeStyles = (theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      padding: 10,
      backgroundColor: theme.colors.background,
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
