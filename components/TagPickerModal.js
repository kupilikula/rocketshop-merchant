import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    View,
    StyleSheet,
    ScrollView, // For the tag list
    Platform,
    useWindowDimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Modal as RNCoreModal, // For Mobile
} from "react-native";
import {
    TextInput,
    Chip,
    Button,
    Text,
    Surface,
    useTheme,
    Modal as PaperModal, // For Web
    Portal,
    Divider, // Added for consistency
} from "react-native-paper";
import Fuse from "fuse.js";
import { useProductTags } from "../api/hooks/useProductTags";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IS_WEB = Platform.OS === 'web';

const getUniqueTagsFromArray = (tagsArray) => {
    if (!tagsArray || !Array.isArray(tagsArray)) return [];
    return [...new Set(tagsArray.map(tag => tag.trim()).filter(tag => tag !== ''))].sort();
};

const TagPickerModal = ({
                            visible,
                            onClose,
                            onApply,
                            name,
                            existingSelectedTags,
                            contentContainerStyle: contentContainerStyleFromParent // For Paper.Modal on web
                        }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const styles = useMemo(() => makeStyles(theme, insets, IS_WEB, windowHeight), [theme, insets, windowHeight]);

    const { storeId } = useSelector((state) => state.store);
    const { data: fetchedStoreTags = [] } = useProductTags(storeId);

    const [allStoreTags, setAllStoreTags] = useState([]);
    const [sessionAddedTags, setSessionAddedTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const textInputRef = useRef(null);

    useEffect(() => {
        if (fetchedStoreTags) {
            setAllStoreTags(getUniqueTagsFromArray(fetchedStoreTags));
        }
    }, [fetchedStoreTags]);

    useEffect(() => {
        if (visible) {
            setSelectedTags(getUniqueTagsFromArray(existingSelectedTags || []));
            setSearchInput("");
            setSessionAddedTags([]);
            // Focus logic handled by onShow for RNCoreModal and useEffect for PaperModal
        }
    }, [visible, existingSelectedTags]);


    const availableTags = useMemo(() => {
        return getUniqueTagsFromArray([...allStoreTags, ...sessionAddedTags]).sort();
    }, [allStoreTags, sessionAddedTags]);

    const fuse = useMemo(() => {
        return new Fuse(availableTags, {
            threshold: 0.3, // Adjust threshold for desired fuzziness
            ignoreLocation: true,
            isCaseSensitive: false,
        });
    }, [availableTags]);

    const displayedTags = useMemo(() => {
        if (!searchInput.trim()) return availableTags;
        if (!fuse) return [];
        return fuse.search(searchInput.trim()).map((result) => result.item);
    }, [searchInput, availableTags, fuse]);

    const handleAddOrSelectTagFromInput = () => {
        const trimmedInput = searchInput.trim();
        if (!trimmedInput) return;

        const existingTagFound = availableTags.find(
            (tag) => tag.toLowerCase() === trimmedInput.toLowerCase()
        );

        let tagToSelect = trimmedInput;

        if (existingTagFound) {
            tagToSelect = existingTagFound; // Use the existing casing
        } else {
            // It's a new tag for this session
            if (!sessionAddedTags.map(t => t.toLowerCase()).includes(trimmedInput.toLowerCase())) {
                setSessionAddedTags((prev) => getUniqueTagsFromArray([...prev, trimmedInput]));
            }
        }

        // Select the tag (either existing or newly added to session)
        if (!selectedTags.includes(tagToSelect)) {
            setSelectedTags((prev) => getUniqueTagsFromArray([...prev, tagToSelect]));
        }
        setSearchInput(""); // Clear input
    };

    const toggleTagSelection = useCallback((tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : getUniqueTagsFromArray([...prev, tag])
        );
    }, []);

    const modalActualContent = (
        <Surface mode={'contained'} style={IS_WEB ? styles.modalInnerSurfaceWeb : styles.modalContainerMobile}>
            <Text variant={'titleMedium'} style={styles.modalTitle}>
                {`Select or Add Tags for "${name}"`}
            </Text>

            <TextInput
                label="Search existing or Add New Tag"
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleAddOrSelectTagFromInput}
                style={styles.input}
                mode="outlined"
                dense
                ref={textInputRef}
                right={<TextInput.Icon onPress={handleAddOrSelectTagFromInput} icon={'plus-circle-outline'} />}
            />

            <Text style={styles.sectionTitle}>Available Tags</Text>
            <View style={styles.tagsScrollViewContainer}>
                <ScrollView
                    contentContainerStyle={styles.chipsContainer}
                    style={styles.tagsScrollViewInstance} // Crucial for mobile scrolling
                    keyboardShouldPersistTaps="handled"
                >
                    {displayedTags.length > 0 ? displayedTags.map((tag) => (
                        <Chip
                            key={tag}
                            selected={(selectedTags || []).includes(tag)}
                            onPress={() => toggleTagSelection(tag)}
                            style={[
                                styles.chip,
                                (selectedTags || []).includes(tag) && styles.chipSelected,
                            ]}
                            textStyle={{
                                color: (selectedTags || []).includes(tag)
                                    ? theme.colors.onPrimary
                                    : theme.colors.onSurfaceVariant,
                            }}
                        >
                            {tag}
                        </Chip>
                    )) : (
                        <Text style={styles.emptyTagListText}>
                            {searchInput.trim() ? "No tags match. Press '+' to add." : (availableTags.length === 0 ? "No existing tags. Add one!" : "No tags to display.")}
                        </Text>
                    )}
                </ScrollView>
            </View>

            <View style={styles.actionContainer}>
                <Button mode="outlined" onPress={onClose} style={styles.actionButton}>
                    Cancel
                </Button>
                <Button mode="contained" onPress={() => onApply(selectedTags)} style={styles.actionButton}>
                    Apply Tags
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
    } else { // Mobile
        return (
            <Portal>
                <RNCoreModal
                    visible={visible}
                    animationType="slide" // Original mobile animation
                    onRequestClose={onClose} // Original mobile dismiss
                    transparent={false}
                    onShow={() => { // Focus for RNCoreModal on mobile
                        if (textInputRef.current) {
                            textInputRef.current.focus();
                        }
                    }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        {modalActualContent}
                    </TouchableWithoutFeedback>
                </RNCoreModal>
            </Portal>
        );
    }
};

const makeStyles = (theme, insets, isWeb, windowHeightParam) => {
    const { colors } = theme;
    return StyleSheet.create({
        // --- Style for Mobile (content of react-native's Modal) ---
        modalContainerMobile: {
            height: "100%",
            paddingHorizontal: 16,
            paddingTop: insets.top + 16, // Using original paddingTop from initial code
            paddingBottom: insets.bottom,
            backgroundColor: colors.surface,
            flex: 1, // Essential for children to use flex
            flexDirection: 'column',
        },
        // --- Styles for Web (using react-native-paper's Modal) ---
        modalContentBoxWeb: {
            backgroundColor: colors.surface,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 24,
            maxHeight: '85vh',
            width: 'auto', // Let parent prop (contentContainerStyleFromParent) dictate width/maxWidth
            minWidth: 320, // Ensure a minimum sensible width
            alignSelf: 'center',
            borderRadius: theme.roundness * 2,
            elevation: 5,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        },
        modalInnerSurfaceWeb: { // For the Surface inside Paper.Modal on Web
            flex: 1,
            flexShrink: 1,
            backgroundColor: 'transparent',
            flexDirection: 'column',
        },
        // --- Common Styles for Modal's Internal Content ---
        modalTitle: {
            marginBottom: 16,
            textAlign: isWeb ? 'left' : 'center',
            fontWeight: 'bold',
            paddingHorizontal: isWeb ? 0 : 8,
            color: colors.onSurface,
        },
        input: {
            marginBottom: 10,
            backgroundColor: "white", // Original
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 8,
            color: colors.onSurfaceVariant,
        },
        tagsScrollViewContainer: { // Container for the ScrollView of tags
            flex: 1,             // Allows ScrollView to take available space
            flexShrink: 1,       // Allows it to shrink if content is small
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.outlineVariant,
            borderRadius: theme.roundness,
            paddingVertical: 5, // Inner padding for the scroll view area
            paddingHorizontal: 5,
        },
        tagsScrollViewInstance: { // Style for the ScrollView component itself
            // No specific style needed here if container handles flex, or add flex:1 if issues persist
        },
        chipsContainer: { // For ScrollView's contentContainerStyle
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            paddingBottom: 5,
        },
        chip: { // Original base style
            margin: 4,
            backgroundColor: colors.softSecondary, // Updated for better unselected appearance
        },
        chipSelected: { // Original selected style
            backgroundColor: colors.secondary, // Use primary for selected
        },
        emptyTagListText: {
            padding: 10,
            textAlign: 'center',
            color: colors.onSurfaceVariant,
            fontStyle: 'italic',
        },
        actionContainer: { // Original style
            flexDirection: "row",
            justifyContent: "flex-end", // Aligned buttons to the right
            marginTop: 16, // Increased margin
            paddingTop: 10,
            borderTopWidth: 1,
            borderColor: colors.outlineVariant,
        },
        actionButton: {
            marginLeft: 8,
        }
    });
};

export default TagPickerModal;