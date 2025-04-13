import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator, Card, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import axiosClient from '../../api/client';
import {resetStoreCreateState, setStoreLogoImage} from '../../store/newStoreSlice';
import { v4 as uuidv4 } from 'uuid';
import {useQueryClient} from "react-query";
import {setStore} from "../../store/storeSlice";
import {Image} from "expo-image";
import {StoreFrontCard} from "../../components/StoreFrontCard";
import LogoIconWithName from "../../components/LogoIconWithName";

export default function StoreSummary() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        storeName,
        storeHandle,
        storeDescription,
        storeLogoImage,
        storeTags,
        firstCollectionName
    } = useSelector((state) => state.newStore);

    const { merchantId } = useSelector((state) => state.merchant);

    const [loading, setLoading] = useState(false);

    const handleCreateStore = async () => {
        setLoading(true);
        const storeId = uuidv4();

        try {
            // 1. Create Store Row
            console.log('Creating store...');
            const res = await axiosClient.post('/stores/createStore', {
                storeId,
                storeName,
                storeHandle,
                storeDescription,
                storeTags,
            });
            console.log('Store created:', res);

            // 2. Upload Logo to Spaces (if selected)
            console.log('Uploading logo...');
            if (storeLogoImage) {
                console.log('Fetching presigned URL for logo upload...');
                const fileKey = `stores/${storeId}/logo`;
                const contentType = 'image/jpeg';
                const { data: [presigned] } = await axiosClient.post(`/stores/${storeId}/mediaUploadPresignedUrls`, {
                    fileKeysWithContentTypes: [{ fileKey, contentType }]
                });
                console.log('Presigned URL:', presigned);
                const res = await fetch(storeLogoImage);
                const blob = await res.blob();

                console.log('Uploading logo...');
                const res2 = await fetch(presigned.presignedUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': contentType,
                        'x-amz-acl': 'public-read',
                    },
                    body: blob,
                });
                console.log('Logo uploaded:', res2);

                // 3. Update storeLogoImage in DB
                console.log('Updating storeLogoImage in DB...');
                const res3 = await axiosClient.post(`/stores/${storeId}/updateLogoImage`, {
                    storeLogoImage: presigned.fileUri,
                });
                console.log('StoreLogoImage updated:', res3);

                console.log('Store created, updating redux slice with logo');
                dispatch(setStore({storeLogoImage: presigned.fileUri}));
            }

            // 4. Create First Collection
            await axiosClient.post(`/stores/${storeId}/collections/addNewCollection`, {
                collectionName: firstCollectionName,
            });

            dispatch(resetStoreCreateState());
            await queryClient.invalidateQueries(['merchantStores', merchantId]);
            // router.reset('/StoreSelector');
            router.replace('/StoreSelector');
        } catch (err) {
            console.error('Failed to create store', err);
            Alert.alert('Error', 'Failed to create store. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
            <Text variant="titleLarge" style={{ marginBottom: 16 }}>
                Store Summary
            </Text>
            {/* Store Preview Card */}
            <StoreFrontCard storeName={storeName} storeLogoImage={storeLogoImage} storeDescription={storeDescription} />

            <View style={{ marginTop: 16 }}>
                <View style={{ display: 'flex', flexDirection: 'row', }}>
                    <Text variant="titleMedium">Store Handle:</Text>
                    <Text style={{ marginLeft: 8, marginBottom: 8 }} variant={'bodyLarge'}>{storeHandle}</Text>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 16}}>
                    <Text variant="titleMedium" >
                        First Collection Name:
                    </Text>
                    <Text variant={"bodyLarge"} style={{marginLeft: 8}}>{firstCollectionName}</Text>
                </View>


                <View style={{ marginVertical: 16 }}>
                <Text variant="titleMedium">Store Tags:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {storeTags.map((tag) => (
                        <Chip key={tag} style={{ margin: 4 }}>{tag}</Chip>
                    ))}
                </View>
                </View>

            </View>

            <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center', marginBottom: 32}}>
            <Button
                mode="contained"
                style={{ marginTop: 32, borderRadius: 8, backgroundColor: theme.colors.success }}
                onPress={handleCreateStore}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : 'Create Store'}
            </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'white',
    },
});