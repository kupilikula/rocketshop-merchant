import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator, Card, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import axiosClient from '../../api/client';
import {resetNewStore, setNewStoreLogoImage} from '../../store/newStoreSlice';
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
        firstCollectionName,
        storeSettings,
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
                storeSettings,
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

            dispatch(resetNewStore());
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
            <Card style={{
                display: 'flex',
                flexDirection: 'column',
                // margin: 16,
                // width: '100%',
                // alignSelf: 'stretch',
                backgroundColor: 'white',
                padding: 16
            }}
            mode={'elevated'}
            >
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: 'center',
                        alignSelf: 'stretch',
                        // width: "100%",
                        // height: "auto",
                        // backgroundColor: 'green'
                    }}
                >
                    <Image
                        source={storeLogoImage}
                        style={{
                            height: 80,
                            width: 80,
                            borderRadius: 40,
                            borderStyle: "solid",
                            borderWidth: 2,
                            borderColor: 'black',
                            margin: 0,
                            padding: 0,
                        }}
                    />
                    <View style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        marginLeft: 8,
                        flex: 1
                    }}>
                        <Text
                            // variant={"displaySmall"}
                            style={{color: 'black', fontSize: 20}}
                            // adjustsFontSizeToFit={true}
                            numberOfLines={2}
                        >
                            {storeName}
                        </Text>
                        <View>
                        </View>
                    </View>

                </View>
                <View style={{ width:'100%', marginTop: 10}}>
                    <Text variant={"bodyLarge"} style={{color: 'black'}}>
                        {storeDescription}
                    </Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 16 }}>
                    <Text variant="titleMedium">Store Handle:</Text>
                    <Text style={{ marginLeft: 8, marginBottom: 8 }} variant={'bodyLarge'}>{storeHandle}</Text>
                </View>

                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 16}}>
                    <Text variant="titleMedium" >
                        First Collection Name:
                    </Text>
                    <Text variant={"bodyLarge"} style={{marginLeft: 8}}>{firstCollectionName}</Text>
                </View>


                <View style={{ marginTop: 16 }}>
                <Text variant="titleMedium">Store Tags:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {storeTags.map((tag) => (
                        <Chip key={tag} style={{ margin: 4 }}>{tag}</Chip>
                    ))}
                </View>
                </View>

            </Card>

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