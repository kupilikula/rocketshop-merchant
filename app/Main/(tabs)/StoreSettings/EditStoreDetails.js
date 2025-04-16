import React, { useState } from 'react';
import {View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform} from 'react-native';
import {Text, TextInput, Button, IconButton, Chip, Avatar, useTheme, Divider} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import axiosClient from '../../../../api/client';
import { setStore } from '../../../../store/storeSlice';
import {useRouter} from "expo-router";

export default function EditStoreDetails() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();
    const store = useSelector((state) => state.store);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(store.storeName);
    const [handle, setHandle] = useState(store.storeHandle);
    const [description, setDescription] = useState(store.storeDescription);
    const [tags, setTags] = useState(store.storeTags || []);
    const [newTag, setNewTag] = useState('');
    const [logo, setLogo] = useState(store.storeLogoImage);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            await uploadLogo(uri);
        }
    };

    const uploadLogo = async (uri) => {
        const fileKey = `stores/${store.storeId}/logo`;
        const res = await axiosClient.post(`/stores/${store.storeId}/mediaUploadPresignedUrls`, {
            fileKeysWithContentTypes: [{ fileKey, contentType: 'image/jpg' }]
        });

        const presignedUrl = res.data[0].presignedUrl;
        const fileUri = res.data[0].fileUri;

        const imageData = await fetch(uri);
        const blob = await imageData.blob();

        await fetch(presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'image/jpg', 'x-amz-acl': 'public-read' },
            body: blob,
        });

        await axiosClient.post(`/stores/${store.storeId}/updateLogoImage`, { storeLogoImage: fileUri });

        setLogo(fileUri);
        dispatch(setStore({ ...store, storeLogoImage: fileUri }));
    };

    const handleSave = async () => {
        try {
            await axiosClient.patch(`/stores/${store.storeId}/updateStoreDetails`, {
                storeName: name,
                storeHandle: handle,
                storeDescription: description,
                storeTags: tags,
            });
            dispatch(setStore({ ...store, storeName: name, storeHandle: handle, storeDescription: description, storeTags: tags }));
            setEditing(false);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to update store details.');
        }
    };
    const discard = () => {
        setName(store.storeName);
        setHandle(store.storeHandle);
        setDescription(store.storeDescription);
        setTags(store.storeTags);
        setEditing(false);
        // router.back();

    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView contentContainerStyle={styles.container} style={{backgroundColor: 'white'}}>
            <View style={{ flex: 1, position: 'relative' }}>
            <View style={styles.header}>
                {!editing && <IconButton icon="pencil" onPress={() => setEditing(true)} />}
            </View>

            {/*<Text variant={'titleMedium'} style={styles.displayText}>Store Logo</Text>*/}
            <View style={styles.logoContainer}>
                {logo ? (
                    <Avatar.Image size={100} source={{ uri: logo }} />
                ) : (
                    <Avatar.Icon size={100} icon="image" style={{ backgroundColor: theme.colors.secondaryContainer }} />
                )}
                {editing && <Button mode={'text'} onPress={pickImage} labelStyle={{fontSize: 16, marginTop: 16}}>Change Logo</Button>}
                {/*<Text variant={'titleMedium'} style={styles.displayText}>Store Logo</Text>*/}
            </View>

            {editing ? (
                <>
                    <TextInput label="Store Name" mode="outlined" value={name} onChangeText={setName} style={styles.input} />
                    <TextInput label="Store Handle" mode="outlined" value={handle} onChangeText={setHandle} style={styles.input} />
                    <TextInput label="Description" mode="outlined" multiline numberOfLines={3} value={description} onChangeText={setDescription} style={styles.input} />

                    <View style={{ marginVertical: 16 }}>
                        <Text variant="titleMedium" style={{ marginBottom: 8 }}>Store Tags</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                placeholder="Add tag"
                                value={newTag}
                                onChangeText={setNewTag}
                                mode="outlined"
                                style={[{ flex: 1, marginRight: 8 }, styles.input]}
                            />
                            <IconButton icon="plus" onPress={() => {
                                if (newTag.trim() && !tags.includes(newTag)) {
                                    setTags([...tags, newTag.trim()]);
                                    setNewTag('');
                                }
                            }}>+</IconButton>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                            {tags.map((tag) => (
                                <Chip key={tag} style={{ marginRight: 4, marginBottom: 4 }} onClose={() => setTags(tags.filter((t) => t !== tag))}>
                                    {tag}
                                </Chip>
                            ))}
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Button mode="contained" onPress={discard} style={{borderRadius: 8, backgroundColor: theme.colors.error}}>Discard Changes</Button>
                        <Button mode="contained" onPress={handleSave} style={{borderRadius: 8}}>Save Changes</Button>
                    </View>
                </>
            ) : (
                <>
                    <Divider style={{ marginVertical: 8 }} />
                    <Text variant={'titleMedium'} style={styles.displayText}>Store Name</Text>
                    <Text variant={'titleLarge'} style={styles.displayText}>{store.storeName}</Text>
                    <Divider style={{ marginVertical: 8 }} />
                    <Text variant={'titleMedium'} style={styles.displayText}>Store Handle</Text>
                    <Text variant={'titleLarge'} style={styles.displayText}>{store.storeHandle}</Text>
                    <Divider style={{ marginVertical: 8 }} />
                    <Text variant={'titleMedium'} style={styles.displayText}>Store Description</Text>
                    <Text variant={'titleLarge'} style={styles.displayText}>{store.storeDescription}</Text>
                    <Divider />
                    <View style={{ marginTop: 12 }}>
                        <Text variant="titleMedium">Store Tags</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                            {store.storeTags.map((tag) => (
                                <Chip key={tag} style={{ marginRight: 4, marginBottom: 4 }}>{tag}</Chip>
                            ))}
                        </View>
                    </View>
                </>
            )}
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: 16,
        flexGrow: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
        position: 'absolute',
        top: 0,
        right: 0,
    },
    logoContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
        backgroundColor: "white",
    },
    displayText: {
        marginBottom: 8,
    },
});