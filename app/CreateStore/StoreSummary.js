import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native'; // Added Platform
import { Text, Button, useTheme, ActivityIndicator, Card, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { getAxiosClient } from '../../api/client';
import {resetNewStore, setNewStoreLogoImage} from '../../store/newStoreSlice'; // setNewStoreLogoImage is imported but not used directly here
import { v4 as uuidv4 } from 'uuid';
import {useQueryClient} from "react-query";
import {setStore} from "../../store/storeSlice";
import {Image} from "expo-image";
// import {StoreFrontCard} from "../../components/StoreFrontCard"; // Was imported but not used
import LogoIconWithName from "../../components/LogoIconWithName";
import {getStoreSelectorPath} from "../../utils/getPathUtils";

export default function StoreSummary() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();

    const {
        storeName,
        storeHandle,
        storeDescription,
        storeLogoImage, // This is the local URI from ImagePicker or existing URI
        storeTags,
        firstCollectionName,
        storeSettings,
        storePolicy,
        legalBusinessName,
        storeEmail,
        storePhone,
        businessType,
        category,
        subcategory,
        registeredAddress,
        isPlatformOwned,
    } = useSelector((state) => state.newStore);

    const { merchantId } = useSelector((state) => state.merchant);

    const [loading, setLoading] = useState(false);

    const handleCreateStore = async () => {
        setLoading(true);
        const storeId = uuidv4();

        try {
            // 1. Create Store Row
            console.log('Creating store...');
            const storeData = { // Consolidate store data
                storeId,
                storeName,
                storeHandle,
                storeDescription,
                storeTags,
                storeSettings, // Ensure this object is structured as the backend expects
                storePolicy,
                legalBusinessName,
                storeEmail,
                storePhone,
                businessType,
                category,
                subcategory,
                registeredAddress,
                isPlatformOwned
            };
            const createStoreResponse = await axiosClient.post('/stores', storeData);
            console.log('Store created:', createStoreResponse);

            let finalStoreLogoImageUri = null;

            // 2. Upload Logo to Spaces (if selected)
            if (storeLogoImage) {
                console.log('Fetching presigned URL for logo upload...');
                const fileKey = `stores/${storeId}/logo.jpg`; // Added extension for clarity, backend might not need it
                const contentType = 'image/jpeg'; // Assuming JPEG, adjust if picker allows other types or conversion
                const { data: [presigned] } = await axiosClient.post(`/stores/${storeId}/media-upload-presigned-urls`, {
                    fileKeysWithContentTypes: [{ fileKey, contentType }]
                });
                console.log('Presigned URL data:', presigned);

                if (!presigned || !presigned.presignedUrl) {
                    throw new Error("Failed to get a presigned URL for logo upload.");
                }

                const imageFetchResponse = await fetch(storeLogoImage);
                const blob = await imageFetchResponse.blob();

                console.log('Uploading logo...');
                const uploadResponse = await fetch(presigned.presignedUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': contentType,
                        'x-amz-acl': 'public-read', // Make sure this is intended and configured on S3/Spaces
                    },
                    body: blob,
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Logo upload failed with status: ${uploadResponse.status}`);
                }
                console.log('Logo uploaded successfully.');
                finalStoreLogoImageUri = presigned.fileUri;

                // 3. Update storeLogoImage in DB
                console.log('Updating storeLogoImage in DB with URI:', finalStoreLogoImageUri);
                await axiosClient.post(`/stores/${storeId}/logo`, {
                    storeLogoImage: finalStoreLogoImageUri,
                });
                console.log('StoreLogoImage updated in DB.');

                // This dispatch was for newStoreSlice, but we are creating a live store.
                // We might want to update the global store state for the *selected* store if this new store becomes active.
                // dispatch(setNewStoreLogoImage(finalStoreLogoImageUri)); // This updates the creation form's state
            }

            // 4. Create First Collection
            console.log('Creating first collection:', firstCollectionName);
            await axiosClient.post(`/stores/${storeId}/collections`, {
                collectionName: firstCollectionName || 'Featured', // Ensure a default collection name
            });
            console.log('First collection created.');

            // Update the global state for the newly created and selected store
            dispatch(setStore({
                storeId: storeId,
                storeName: storeName,
                storeHandle: storeHandle,
                storeLogoImage: finalStoreLogoImageUri, // Use the uploaded URI
                // ... any other essential fields for storeSlice
            }));


            dispatch(resetNewStore());
            await queryClient.invalidateQueries(['merchantStores', merchantId]);
            Alert.alert('Success!', 'Your store has been created successfully.'); // Give success feedback
            router.replace(getStoreSelectorPath({ newStoreId: storeId })); // Navigate and potentially highlight new store
        } catch (err) {
            console.error('Failed to create store:', err);
            Alert.alert('Error Creating Store', err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{backgroundColor: 'white'}} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
            <Card style={styles.card} mode={'elevated'}>
                <View style={styles.cardHeader}>
                    <Image
                        source={storeLogoImage || require('../../assets/images/icon.png')} // Fallback image
                        style={styles.logoImage}
                        contentFit="cover"
                    />
                    <View style={styles.storeNameContainer}>
                        <Text style={styles.storeNameText} numberOfLines={2}>
                            {storeName || "Your Store Name"}
                        </Text>
                    </View>
                </View>

                {Boolean(isPlatformOwned) && (
                    <Text variant={"titleMedium"} style={styles.platformStoreText}>
                        RocketShop Platform Store
                    </Text>
                )}

                {Boolean(storeDescription) && (
                    <View style={styles.sectionContainer}>
                        <Text variant={"bodyLarge"} style={styles.descriptionText}>
                            {storeDescription}
                        </Text>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <Text variant="titleMedium" style={styles.detailLabel}>Store Handle:</Text>
                    <Text variant={'bodyLarge'} style={styles.detailValue}>{storeHandle || "N/A"}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text variant="titleMedium" style={styles.detailLabel}>First Collection:</Text>
                    <Text variant={"bodyLarge"} style={styles.detailValue}>{firstCollectionName || "Featured"}</Text>
                </View>

                {storeTags && storeTags.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text variant="titleMedium" style={styles.detailLabel}>Store Tags:</Text>
                        <View style={styles.tagsChipContainer}>
                            {storeTags.map((tag) => (
                                <Chip key={tag} style={styles.chip} mode="contained">{tag}</Chip>
                            ))}
                        </View>
                    </View>
                )}
            </Card>

            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    style={styles.createButton}
                    onPress={handleCreateStore}
                    disabled={loading}
                    // contentStyle={{paddingVertical: 6}}
                    labelStyle={{fontSize: 16}}
                >
                    {loading ? <ActivityIndicator color="white" size="small"/> : 'Create My Store!'}
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center', // Vertically center if content is shorter than screen
        padding: 16,
        backgroundColor: 'white', // Ensure background consistency
        // Web-specific styles
        ...(Platform.OS === 'web' && {
            width: '100%',
            maxWidth: 600, // Max width for the summary content on web
            alignSelf: 'center', // Center the content block
        }),
    },
    card: {
        padding: 16,
        backgroundColor: 'white', // Card background
        width: '100%', // Ensure card takes full width of its container (up to maxWidth on web)
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    logoImage: {
        height: 80,
        width: 80,
        borderRadius: 40, // Circular logo
        borderWidth: 1,
        borderColor: '#e0e0e0', // Softer border color
    },
    storeNameContainer: {
        marginLeft: 16, // Spacing between logo and name
        flex: 1, // Allow store name to take remaining space
    },
    storeNameText: {
        fontSize: 22, // Larger font for store name
        fontWeight: 'bold',
        color: 'black', // Ensure text color
    },
    platformStoreText: {
        color: 'black', // Ensure text color
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 16,
    },
    sectionContainer: {
        marginTop: 16,
    },
    descriptionText: {
        color: 'black', // Ensure text color
        lineHeight: 22, // Improve readability
    },
    detailRow: {
        flexDirection: 'row',
        marginTop: 12, // Consistent spacing for detail rows
        alignItems: 'flex-start', // Align items to the start for multiline values
    },
    detailLabel: {
        fontWeight: 'bold', // Make labels bold
        marginRight: 8,
        color: 'black',
    },
    detailValue: {
        flex: 1, // Allow value to wrap
        color: 'black',
    },
    tagsChipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8, // Space above chips
    },
    chip: {
        margin: 4, // Spacing around each chip
    },
    buttonContainer: {
        alignSelf: 'center', // Center the button container
        justifyContent: 'center',
        marginTop: 32, // Space above the button
        marginBottom: 32, // Space below the button
        // width: '90%', // Control button container width
        maxWidth: 350, // Max width for the button itself
    },
    createButton: {
        borderRadius: 8,
        // backgroundColor: theme.colors.success, // This was in JSX, can be here too
        // No need for specific width here if buttonContainer controls it
    }
});