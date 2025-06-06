import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Chip, useTheme, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { addNewStoreTag, removeNewStoreTag } from '../../store/newStoreSlice';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";

const IS_WEB = Platform.OS === 'web';

export default function StoreTags() {
    const theme = useTheme(); // Used implicitly by Paper components
    const router = useRouter();
    const dispatch = useDispatch();

    const storeTags = useSelector((state) => state.newStore.storeTags);
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = () => {
        if (tagInput.trim() === '') return;
        if (storeTags.includes(tagInput.trim())) {
            // Optionally provide feedback that tag already exists
            setTagInput(''); // Clear input even if tag exists to avoid confusion
            return;
        }
        dispatch(addNewStoreTag(tagInput.trim()));
        setTagInput('');
    };

    const handleRemoveTag = (tag) => {
        dispatch(removeNewStoreTag(tag));
    };

    const commonWrapperStyle = { flex: 1, backgroundColor: 'white' };

    const screenContent = (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, justifyContent: 'center' }}> 
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleLarge" style={styles.heading}>Add Store Tags</Text>

                <View style={styles.inputRow}>
                    <TextInput
                        label="Enter a tag" // Changed label for better clarity
                        mode="outlined"
                        value={tagInput}
                        onChangeText={setTagInput}
                        style={styles.input}
                        onSubmitEditing={handleAddTag} // Allows adding tag by pressing 'Enter/Return' key
                        returnKeyType="done" // Shows 'Done' on keyboard instead of 'Next'
                    />
                    <IconButton
                        icon="plus-circle" // Using a more indicative icon
                        size={32} // Slightly larger for better tap target
                        onPress={handleAddTag}
                        style={styles.addButton}
                        mode="contained" // Makes the button background match theme if desired, or leave as default
                        iconColor={theme.colors.primary} // Explicitly color the icon
                    />
                </View>

                <View style={styles.tagsContainer}>
                    {storeTags.map((tag) => (
                        <Chip
                            key={tag}
                            style={styles.tagChip}
                            onClose={() => handleRemoveTag(tag)}
                            mode="flat" // Outlined might look good too
                        >
                            {tag}
                        </Chip>
                    ))}
                </View>

                <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center'}}>
                    <Button
                        mode="contained"
                        onPress={() => router.push(IS_WEB ? '/create_store/first_collection' : '/CreateStore/CreateFirstCollection')}
                        style={styles.nextButton}
                        disabled={storeTags.length === 0} // Optionally disable if no tags
                    >
                        Next
                    </Button>
                </View>
            </View>
        </ScrollView>
    );

    if (Platform.OS === 'web') {
        return (
            <View style={commonWrapperStyle}>
                {screenContent}
            </View>
        );
    } else {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={commonWrapperStyle}
            >
                {screenContent}
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: 'white', // Explicitly set as per original
        // Web-specific styles for a centered, max-width layout
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 600, // Max width for the content on web
            alignSelf: 'center',
        }),
    },
    heading: {
        marginBottom: 24,
        textAlign: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center', // Vertically aligns TextInput and IconButton
        marginBottom: 16, // Added space after input row before tags appear
    },
    input: {
        flex: 1, // Allows TextInput to take available space
        backgroundColor: 'white',
    },
    addButton: {
        marginLeft: 8,
        // The IconButton itself might need margin if it's too close to the input box's border
        // Or adjust its container if Paper's IconButton includes its own padding impacting visual alignment
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allows tags to wrap to the next line
        marginTop: 16, // Space above the tags list
        gap: 8, // Spacing between tags (for React Native 0.71+)
        // If not supported, use margin on tagChip instead for older RN versions
    },
    tagChip: {
        // If 'gap' is not used in tagsContainer or for older RN versions:
        // marginRight: 8,
        // marginBottom: 8,
        // Original had marginRight: 4, marginBottom: 4. If 'gap' is used, these might be redundant or additive.
        // For strict adherence to original visual spacing with gap, these might need to be removed if gap is 8.
        // Keeping original margins for now, they will add to the 'gap'.
        marginRight: 4,
        marginBottom: 4,
    },
    nextButton: {
        marginTop: 32, // Space above the next button
        borderRadius: 8,
        paddingHorizontal: 16, // Give button a bit more horizontal padding
    },
});