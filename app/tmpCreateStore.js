// app/CreateStore/index.js
import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from "react-native";
import { Text, TextInput, Button, useTheme, Chip } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import axiosClient from "../api/client";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';

export default function TmpCreateStore() {
    const theme = useTheme();
    const router = useRouter();
    const merchantId = useSelector((state) => state.merchant.merchantId);
    const storeId = uuidv4();

    const [step, setStep] = useState(0);
    const [storeName, setStoreName] = useState("");
    const [storeHandle, setStoreHandle] = useState("");
    const [storeDescription, setStoreDescription] = useState("");
    const [localStoreLogo, setLocalStoreLogo] = useState(null);
    const [storeTags, setStoreTags] = useState([]);
    const [newTag, setNewTag] = useState("");

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "Please allow media access to select a logo.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setLocalStoreLogo(result.assets[0].uri);
        }
    };

    const uploadLogoToSpaces = async () => {
        const fileKey = `stores/${storeId}/logo/${uuidv4()}`;
        const contentType = 'image/jpeg';

        const { data: [presignedUrlData] } = await axiosClient.post(`/stores/${storeId}/mediaUploadPresignedUrls`, {
            fileKeysWithContentTypes: [{ fileKey, contentType }],
        });

        const res = await fetch(localStoreLogo);
        const blob = await res.blob();

        await fetch(presignedUrlData.presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'x-amz-acl': 'public-read',
            },
            body: blob,
        });

        return presignedUrlData.fileUri;
    };

    const handleCreateStore = async () => {
        try {
            await axiosClient.post('/stores/createStore', {
                storeId,
                storeName,
                storeHandle,
                storeDescription,
                storeLogoImage: null,
                storeTags,
            });

            let storeLogoImageUrl = null;
            if (localStoreLogo) {
                try {
                    storeLogoImageUrl = await uploadLogoToSpaces();
                } catch (err) {
                    console.error("Failed to upload logo to spaces:", err);
                } finally {
                    if (storeLogoImageUrl) {
                        await axiosClient.post(`/stores/${storeId}/updateLogoImage`, {
                            logoImageUrl: storeLogoImageUrl
                        });
                    }
                }
            }
            router.replace("/Main/(tabs)/Dashboard");
        } catch (err) {
            console.error("Failed to create store:", err);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <>
                        <Text variant="titleMedium">Enter Store Name</Text>
                        <TextInput
                            mode="outlined"
                            value={storeName}
                            onChangeText={setStoreName}
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={() => setStep(1)}>
                            Next
                        </Button>
                    </>
                );
            case 1:
                return (
                    <>
                        <Text variant="titleMedium">Choose Store Handle</Text>
                        <TextInput
                            mode="outlined"
                            value={storeHandle}
                            onChangeText={setStoreHandle}
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={() => setStep(2)}>
                            Next
                        </Button>
                    </>
                );
            case 2:
                return (
                    <>
                        <Text variant="titleMedium">Describe Your Store</Text>
                        <TextInput
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            value={storeDescription}
                            onChangeText={setStoreDescription}
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={() => setStep(3)}>
                            Next
                        </Button>
                    </>
                );
            case 3:
                return (
                    <>
                        <Text variant="titleMedium">Select Store Logo</Text>
                        {localStoreLogo ? (
                            <Image source={{ uri: localStoreLogo }} style={styles.logoPreview} />
                        ) : (
                            <Button mode="outlined" onPress={pickImage}>
                                Pick Image
                            </Button>
                        )}
                        <Button mode="contained" onPress={() => setStep(4)}>
                            Next
                        </Button>
                    </>
                );
            case 4:
                return (
                    <>
                        <Text variant="titleMedium">Add Store Tags</Text>
                        <View style={styles.tagContainer}>
                            {storeTags.map((tag) => (
                                <Chip key={tag} onClose={() => setStoreTags(storeTags.filter(t => t !== tag))}>
                                    {tag}
                                </Chip>
                            ))}
                        </View>
                        <TextInput
                            mode="outlined"
                            placeholder="Add Tag"
                            value={newTag}
                            onChangeText={setNewTag}
                            onSubmitEditing={() => {
                                if (newTag.trim() !== '') {
                                    setStoreTags([...storeTags, newTag.trim()]);
                                    setNewTag('');
                                }
                            }}
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={handleCreateStore}>
                            Create Store
                        </Button>
                    </>
                );
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {renderStep()}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        marginBottom: 16,
        backgroundColor: "white",
    },
    logoPreview: {
        width: 150,
        height: 150,
        borderRadius: 75,
        alignSelf: 'center',
        marginVertical: 16,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
});