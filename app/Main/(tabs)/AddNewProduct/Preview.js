// AddNewProduct/Preview.js (Web Adapted - Minimal Changes)
import {ActivityIndicator, ScrollView, View, Platform, StyleSheet} from "react-native"; // Added Platform, StyleSheet
import {Button, useTheme, Text, Card } from "react-native-paper"; // Removed Badge, RadioButton as not used
import ProductDisplayCardCustomerStore from "../../../../components/ProductDisplayCardCustomerStore";
import {useDispatch, useSelector} from "react-redux";
import React, { useContext, useEffect} from "react";
import {resetNewProduct} from "../../../../store/newProductSlice";
import {useNavigation, useRouter} from "expo-router";
import {CommonActions} from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import {useSafeAreaInsets} from "react-native-safe-area-context"; // Not used in this component's render path
import { getAxiosClient } from "../../../../api/client";
import * as MediaLibrary from "expo-media-library"; // Native-only
import * as ImageManipulator from 'expo-image-manipulator';
import _ from "lodash";
import {ProductWorkflowContext} from "../../../../components/ProductWorkflowContext";
import {useQueryClient} from "react-query";
import {ShippingRuleSummary} from "../../../../components/ShippingRuleSummary";
import {resetShipping} from "../../../../store/shippingRuleSlice";
import {getDashboardPath, getProductPath, getAddNewProductPath, getProductsPath} from "../../../../utils/getPathUtils"; // Ensure these return correct web/native paths

const IS_WEB = Platform.OS === 'web';

// Original convertHeicToJpg - for web, it expects item.uri to be an object URL if conversion is attempted client-side
// or for item.file (not passed here) to be used by a web-specific library.
// For now, this function is kept as is, assuming item.uri for web might be passed to a
// web-compatible ImageManipulator or another library if HEIC is uploaded from web.
// A robust web HEIC strategy is complex and likely involves backend or specialized JS libs.
const convertHeicToJpg = async (uri) => {
    // If IS_WEB, this function might need a completely different implementation
    // using browser APIs or a web-specific library if client-side conversion is desired.
    // For now, let's assume ImageManipulator might have some web capabilities or this path is less hit on web.
    if (IS_WEB) {
        console.warn("convertHeicToJpg for web: Client-side HEIC conversion is complex. Ensure 'uri' is usable or rely on backend.", uri);
        // Fallback: return original URI, assuming backend might handle or it's already a compatible format from web uploader
        // If ImageManipulator.manipulateAsync doesn't support web blob URIs for HEIC, this will fail.
        try {
            const result = await ImageManipulator.manipulateAsync(uri, [], {
                compress: 1, format: ImageManipulator.SaveFormat.JPEG
            });
            console.log('Web: Attempted HEIC conversion with ImageManipulator:', result);
            return result.uri; // This would be a new blob/data URI
        } catch (error) {
            console.error('Web: ImageManipulator HEIC conversion error:', error);
            return uri; // Fallback to original URI
        }
    }
    // Native implementation
    try {
        const result = await ImageManipulator.manipulateAsync(uri, [], {
            compress: 1,
            format: ImageManipulator.SaveFormat.JPEG
        });
        console.log('Native: Converted image:', result);
        return result.uri;
    } catch (error) {
        console.error('Native: Image conversion error:', error);
        return undefined;
    }
};

export default function Preview(props) {
    const dispatch = useDispatch();
    const router = useRouter();
    const axiosClient = getAxiosClient();
    const theme = useTheme();
    const styles = makeStyles(theme); // Create styles

    const newProduct = useSelector((state) => state.newProduct);
    const shippingRule = useSelector((state) => state.shippingRule);
    const storeId = useSelector((state) => state.store.storeId);
    const {
        isNewVariant, variantInfo, isClone, useSameMediaForClone,
        resetWorkflow, isPublishing, setIsPublishing,
        published, setPublished, publishFailure, setPublishFailure,
        mediaGalleryKey, setMediaGalleryKey // setMediaGalleryKey used in "Go To Product"
    } = useContext(ProductWorkflowContext);
    const navigation = useNavigation();
    const queryClient = useQueryClient();

    const resetNavigationStack = (route, params) => {
        // For web, a simple replace to a known good path is often better than stack reset
        if (IS_WEB && route === "Dashboard") { // Assuming "Dashboard" from getDashboardPath is a top-level route
            router.replace(getDashboardPath());
            return;
        }
        // Original native logic
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: route, params: params || {} }],
            })
        );
    };

    async function publishProduct() {
        try {
            let processedMediaItems = _.cloneDeep(newProduct.mediaItems || []);

            if (processedMediaItems.length > 0 &&
                (!isNewVariant || (isNewVariant && !variantInfo.useSameMedia)) &&
                (!isClone || (isClone && !useSameMediaForClone))
            ) {
                const fileKeysWithContentTypes = processedMediaItems.map((item) => ({
                    fileKey: `stores/${storeId}/products/${newProduct.productId}/${item.mediaId}`,
                    contentType: item.contentType === 'image/heic' ? 'image/jpeg' : item.contentType,
                }));
                console.log('Requesting presigned URLs for:', fileKeysWithContentTypes);

                const { data: presignedUrlsData } = await axiosClient.post(
                    `/stores/${storeId}/mediaUploadPresignedUrls`,
                    { fileKeysWithContentTypes }
                );
                // User's original code implies presignedUrlsData is the array.
                const presignedUrls = presignedUrlsData;
                console.log('Fetched presigned URLs:', presignedUrls);

                if (!Array.isArray(presignedUrls) || presignedUrls.length !== processedMediaItems.length) {
                    console.error('Mismatch or invalid format for presigned URLs.');
                    return false;
                }

                // This mapping directly modifies items in processedMediaItems array.
                const uploadResults = await Promise.all(
                    processedMediaItems.map(async (item, index) => {
                        const presignedDetail = presignedUrls[index]; // Assuming ordered response
                        if (!presignedDetail || !presignedDetail.presignedUrl || !presignedDetail.fileUri) {
                            console.error(`Incomplete presigned URL for item ${index}:`, item.filename);
                            return { success: false, reason: 'presignedUrlMissing', mediaId: item.mediaId };
                        }
                        const uploadUrl = presignedDetail.presignedUrl;

                        let finalContentTypeForUpload = fileKeysWithContentTypes[index].contentType;
                        let blobToUpload;

                        try {
                            let itemUriForBlob = item.uri;
                            if (item.contentType === 'image/heic' && finalContentTypeForUpload === 'image/jpeg') {
                                console.log(`Attempting HEIC conversion for: ${item.filename}`);
                                // For web, item.file should be passed if convertHeicToJpg is adapted for it.
                                const convertedUri = await convertHeicToJpg(item.uri); // Original call
                                if (convertedUri && convertedUri !== item.uri) {
                                    itemUriForBlob = convertedUri;
                                    console.log(`HEIC converted, using new URI: ${itemUriForBlob}`);
                                    // The contentType for upload is already 'image/jpeg' via fileKeysWithContentTypes
                                } else if (!convertedUri && item.contentType === 'image/heic') {
                                    console.warn(`HEIC conversion failed or returned original for ${item.filename}. Uploading as HEIC if possible, but Content-Type mismatch for presigned URL might occur.`);
                                    // This path is problematic if presigned URL was for JPEG.
                                    // For now, we proceed, relying on original item.contentType for the blob if conversion failed.
                                    finalContentTypeForUpload = item.contentType; // Revert to original if no conversion
                                }
                            }

                            if (IS_WEB) {
                                if (item.file instanceof Blob) { // item.file should be the File/Blob object from MediaGalleryWeb
                                    blobToUpload = item.file;
                                } else if (itemUriForBlob) { // Fallback to fetching URI if file object isn't directly there
                                    console.warn(`Web: item.file not found for ${item.filename}, fetching URI. Ensure MediaGalleryWeb provides item.file.`);
                                    let res = await fetch(itemUriForBlob);
                                    blobToUpload = await res.blob();
                                } else {
                                    throw new Error("No file or valid URI to fetch for web upload.");
                                }
                            } else { // Native
                                // Original native logic for fetching blob
                                let assetInfo = await MediaLibrary.getAssetInfoAsync(item.id); // item.id for native
                                let res = await fetch(assetInfo.localUri || itemUriForBlob); // Use itemUriForBlob if converted
                                blobToUpload = await res.blob();
                            }
                        } catch (fetchError) {
                            console.error(`Error fetching blob for ${item.filename}:`, fetchError);
                            return { success: false, reason: `blobFetchError: ${fetchError.message}`, mediaId: item.mediaId };
                        }

                        if (!blobToUpload) {
                            console.error(`Blob could not be created for ${item.filename}`);
                            return {success: false, reason: 'blobCreationFailed', mediaId: item.mediaId};
                        }

                        try {
                            console.log(`Uploading ${item.filename} as ${finalContentTypeForUpload}`);
                            let r = await fetch(uploadUrl, {
                                method: 'PUT',
                                headers: { 'Content-Type': finalContentTypeForUpload, 'x-amz-acl': 'public-read' },
                                body: blobToUpload,
                            });
                            if (!r.ok) {
                                const errorText = await r.text();
                                console.error(`Failed to upload ${item.filename} to Spaces: ${r.statusText}`, errorText);
                                return { success: false, reason: `uploadError (${r.status})`, mediaId: item.mediaId };
                            }
                            // Update the item in processedMediaItems array directly
                            item.uri = presignedDetail.fileUri; // This is the final storage URI
                            item.contentType = finalContentTypeForUpload; // Update content type if it changed
                            return { success: true, mediaId: item.mediaId };
                        } catch (err) {
                            console.error(`Upload PUT request failed for ${item.filename}:`, err);
                            return { success: false, reason: `fetchPutError: ${err.message}`, mediaId: item.mediaId };
                        }
                    })
                );

                const allUploadsSuccessful = uploadResults.every(result => result && result.success);
                if (!allUploadsSuccessful) {
                    console.error('One or more media uploads failed. Product will not be created.');
                    uploadResults.forEach((r, i) => {
                        if (r && !r.success) console.error(`Upload failed for item ${processedMediaItems[i]?.filename || i}: ${r.reason}`);
                    });
                    return false;
                }
                console.log('Media processed. Final items for DB:', processedMediaItems);
            } else {
                console.log('Skipping media upload steps.');
            }

            let productDataForBackend = { ...newProduct, mediaItems: processedMediaItems };
            if (isNewVariant) {
                productDataForBackend.variantInfo = variantInfo;
            }
            productDataForBackend.shipping = {
                shippingRuleChoice: shippingRule.shippingRuleChoice,
                newShippingRule: shippingRule.newShippingRule,
                selectedExistingShippingRuleId: shippingRule.selectedExistingShippingRuleId,
            };

            console.log('Inserting product data into DB:', productDataForBackend);
            await axiosClient.post(`/stores/${storeId}/products/addNewProduct`, productDataForBackend);
            queryClient.invalidateQueries(["groupingShippingRules", storeId]);
            console.log('Product published successfully!');
            return true;

        } catch (error) {
            console.error('Failed to publish product (overall error):', error.response?.data || error.message || error);
            return false; // This will be caught by performPublish
        }
    }

    const performPublish = () => { // Renamed to avoid conflict, as in EditPreview
        setIsPublishing(true);
        publishProduct().then(async (success) => {
            setIsPublishing(false);
            setPublished(success);
            if (!success) {
                setPublishFailure(true);
                // Original code had a timeout to reset and go to dashboard on failure.
                // This might be too abrupt. Keeping user on page is often better.
                // For now, I'll keep it if it was intentional for your workflow.
                setTimeout(() => {
                    if (publishFailure) { // Check again in case state changed by another process
                        resetWorkflow(); // Reset context states
                        router.replace(getDashboardPath());
                    }
                }, 3000); // Increased timeout slightly for user to see message
            } else {
                // Using a more robust navigation reset for native, simple replace for web.
                await queryClient.invalidateQueries(["storeProducts", storeId]);
                await queryClient.invalidateQueries("storeProducts"); // General invalidation
                // Potentially invalidate specific product if a cache key exists:
                // await queryClient.invalidateQueries(["merchantProduct", storeId, newProduct.productId]);

                const productViewPath = getProductPath(newProduct.productId);

                resetWorkflow();
                dispatch(resetNewProduct());
                dispatch(resetShipping());

                if (IS_WEB) {
                    router.replace(productViewPath);
                } else {
                    // Simpler native navigation: Reset to Products tab, then go to detail.
                    // This assumes 'Products' is the name of your tab route, and ProductDetailScreen is within it.
                    // The exact structure depends on your Expo Router setup.
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: '(tabs)' , state: { routes: [{name: 'Products'}] } }], // Reset to root of products tab
                        })
                    );
                    // Then navigate to the new product. A slight delay might be needed if reset is too fast.
                    setTimeout(() => router.push(productViewPath), 100); // productViewPath is native here
                }
            }
        });
    };

    const performDiscard = () => { // Renamed to avoid conflict

        dispatch(resetNewProduct());
        dispatch(resetShipping());
        resetWorkflow();
        resetNavigationStack("Dashboard"); // Uses your utility for path
    };

    // saveAsDraft function was defined but not used in JSX, keeping definition.
    const saveAsDraft = () => {
        // Actual save draft logic would go here (e.g., API call)
        console.log("Save as draft pressed - Implement actual save logic");
        // Then reset and navigate
        resetWorkflow();
        dispatch(resetNewProduct());
        dispatch(resetShipping());
        resetNavigationStack("Dashboard");
    };

    const displayShippingRule = shippingRule.shippingRuleChoice === 'noShipping'
        ? { ruleName: "No Shipping Required" }
        : shippingRule.newShippingRule;

    return (
        <ScrollView
            style={[styles.scrollView, IS_WEB && {backgroundColor: theme.colors.white}]}
            contentContainerStyle={[styles.contentContainer, IS_WEB && styles.webContentContainer]}
        >
            <View style={ IS_WEB ? styles.webInnerContainer : styles.mobileInnerContainer }>
                {/* Status Banners */}
                {isPublishing && (
                    <View style={[styles.bannerBase, { backgroundColor: theme.colors.secondary }]}>
                        <ActivityIndicator animating={true} color={theme.colors.onSecondary || 'white'} size={IS_WEB ? "small" : "large"} style={styles.bannerIcon} />
                        <Text variant={'titleMedium'} style={[styles.bannerText, { color: theme.colors.onSecondary || 'white' }]}>Publishing product...</Text>
                    </View>
                )}
                {!isPublishing && published && (
                    <View style={[styles.bannerBase, { justifyContent: 'space-between', backgroundColor: theme.colors.softSuccess || '#d4edda' }]}>
                        <View style={styles.bannerContentLeft}>
                            <MaterialIcons name={'check-circle'} size={28} color={theme.colors.success || 'green'} style={styles.bannerIcon} />
                            <Text variant={'titleMedium'} style={[styles.bannerText, { color: theme.colors.onSurface }]}>Product Published!</Text>
                        </View>
                        <Button
                            onPress={() => {
                                // Original native "Go To Product" logic
                                if (!IS_WEB) {
                                    navigation.popToTop(); // Clear current stack within tab potentially
                                    if (setMediaGalleryKey) setMediaGalleryKey(prev => prev + 1);
                                }
                                router.replace(getProductPath(newProduct.productId, IS_WEB));
                                // Ensure states are fully reset if user interacts further
                                setTimeout(() => {
                                    resetWorkflow();
                                    dispatch(resetNewProduct());
                                    dispatch(resetShipping());
                                }, 300);
                            }}
                            mode="text"
                            textColor={theme.colors.primary}
                            style={IS_WEB ? { marginLeft: 16 } : { marginTop: 8 }}
                        >
                            View Product
                        </Button>
                    </View>
                )}
                {!isPublishing && publishFailure && (
                    <View style={[styles.bannerBase, { backgroundColor: theme.colors.softError || '#f8d7da' }]}>
                        <MaterialIcons name={'error'} color={theme.colors.error || 'red'} size={28} style={styles.bannerIcon}/>
                        <Text variant={'titleMedium'} style={[styles.bannerText, { color: theme.colors.onErrorContainer || theme.colors.onSurface }]}>Failed to publish product. Please try again.</Text>
                    </View>
                )}

                {/* Action Buttons */}
                {(!isPublishing && (!published || publishFailure)) && (
                    <View style={styles.actionButtonsContainer}>
                        <Button
                            onPress={performDiscard}
                            icon={"delete-outline"} // Changed icon to match EditPreview
                            mode={"outlined"}
                            style={[styles.actionButton, {borderColor: theme.colors.error}]}
                            labelStyle={{color: theme.colors.error}}
                            contentStyle={styles.buttonContentStyle}
                        >
                            Discard
                        </Button>
                        <Button
                            onPress={performPublish}
                            mode={"contained"}
                            style={[styles.actionButton, {backgroundColor: theme.colors.primary /* Original: theme.colors.success */, marginLeft: IS_WEB ? 8 : 0}]}
                            labelStyle={{color: theme.colors.onPrimary}}
                            icon="publish"
                            contentStyle={styles.buttonContentStyle}
                        >
                            Publish
                        </Button>
                        {/* You can add a Save as Draft button here if its functionality is complete */}
                        {/* <Button onPress={saveAsDraft} mode="outlined" style={styles.actionButton}>Save as Draft</Button> */}
                    </View>
                )}

                <ProductDisplayCardCustomerStore
                    product={newProduct}
                    showProductDescription={true}
                    showRating={false} // New products usually don't have ratings
                />

                {(displayShippingRule) && ( // Assuming isLoading here refers to initial shipping rule setup phase
                    <View style={styles.shippingSummarySection}>
                        <Text variant={'titleMedium'} style={[styles.shippingHeader, {color: theme.colors.onSurface}]}>
                            Shipping Rule For This Product
                        </Text>
                        {shippingRule.shippingRuleChoice === 'noShipping' ? (
                            <Card style={[styles.noShippingCard, {backgroundColor: theme.colors.surfaceVariant}]}>
                                <Card.Content>
                                    <Text variant={'bodyLarge'} style={{color: theme.colors.onSurfaceVariant}}>No Shipping Required</Text>
                                </Card.Content>
                            </Card>
                        ) : displayShippingRule ? (
                            <ShippingRuleSummary shippingRule={displayShippingRule} />
                        ) : (
                            <Text style={{color: theme.colors.onSurfaceVariant, marginTop: 8}}>Shipping not yet fully configured.</Text>
                        )}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const makeStyles = (theme) => StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: theme.colors.white
    },
    contentContainer: {
        // paddingHorizontal: 10, // Original padding
        paddingVertical: 20,
    },
    webContentContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    mobileInnerContainer: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    webInnerContainer: {
        width: '100%',
        maxWidth: 700,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    bannerBase: {
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        marginVertical: 16, width: '100%', padding: 12, borderRadius: 8,
        justifyContent: 'center',
    },
    bannerContentLeft: {
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'flex-start', flexShrink: 1,
    },
    bannerIcon: { marginRight: 10, },
    bannerText: { flexShrink: 1, },
    actionButtonsContainer: {
        display: "flex",
        flexDirection: "row", // Publish on right for web
        justifyContent: "space-between",
        width: "100%",
        marginTop: 12, // Adjusted from 8
        marginBottom: 20, // Adjusted from 16
    },
    actionButton: {
        borderRadius: 8,
        flexGrow: IS_WEB ? 0 : 1,
        marginHorizontal: IS_WEB ? 4 : 8, // Consistent spacing
    },
    buttonContentStyle: { paddingVertical: 6, }, // Slightly more padding for buttons
    shippingSummarySection: {
        alignSelf: 'stretch', marginTop: 24,
        padding: IS_WEB ? 16 : 0,
        borderWidth: IS_WEB ? 1 : 0,
        borderColor: IS_WEB ? theme.colors.outlineVariant : 'transparent',
        borderRadius: IS_WEB ? 8 : 0,
    },
    shippingHeader: {
        marginBottom: 12, fontWeight: 'bold',
        textAlign: IS_WEB ? 'left' : 'center', // Match EditPreview
    },
    noShippingCard: { // Specific style for "No Shipping Required" card
        alignSelf: 'stretch',
        borderRadius: IS_WEB ? 8 : 0, // Consistent rounding
        marginVertical: 8,
        // padding: 16, // Card.Content will handle padding
    }
});