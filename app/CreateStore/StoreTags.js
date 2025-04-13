import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Chip, useTheme, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { addStoreTag, removeStoreTag } from '../../store/newStoreSlice';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";

export default function StoreTags() {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();

    const storeTags = useSelector((state) => state.newStore.storeTags);
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = () => {
        if (tagInput.trim() === '') return;
        if (storeTags.includes(tagInput.trim())) return;
        dispatch(addStoreTag(tagInput.trim()));
        setTagInput('');
    };

    const handleRemoveTag = (tag) => {
        dispatch(removeStoreTag(tag));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: 'white' }}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleLarge" style={styles.heading}>Add Store Tags</Text>

                <View style={styles.inputRow}>
                    <TextInput
                        label="Tag"
                        mode="outlined"
                        value={tagInput}
                        onChangeText={setTagInput}
                        style={styles.input}
                        onSubmitEditing={handleAddTag}
                    />
                    <IconButton
                        icon="plus"
                        size={28}
                        onPress={handleAddTag}
                        style={styles.addButton}
                    />
                </View>

                <View style={styles.tagsContainer}>
                    {storeTags.map((tag) => (
                        <Chip
                            key={tag}
                            style={styles.tagChip}
                            onClose={() => handleRemoveTag(tag)}
                        >
                            {tag}
                        </Chip>
                    ))}
                </View>

                    <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center'}}>
                <Button
                    mode="contained"
                    onPress={() => router.push('/CreateStore/CreateFirstCollection')}
                    style={styles.nextButton}
                >
                    Next
                </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    heading: {
        marginBottom: 24,
        textAlign: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
    },
    addButton: {
        marginLeft: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        gap: 8,
    },
    tagChip: {
        marginRight: 4,
        marginBottom: 4,
    },
    nextButton: {
        marginTop: 32,
        borderRadius: 8,
    },
});