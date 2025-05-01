import {ActivityIndicator, ScrollView, View} from "react-native";
import {Button, useTheme, Text, Card, Badge, RadioButton} from "react-native-paper";
import ProductDisplayCardCustomerStore from "../../../../components/ProductDisplayCardCustomerStore";
import {useDispatch, useSelector} from "react-redux";
import React, { useContext, useEffect} from "react";
import {resetNewProduct} from "../../../../store/newProductSlice";
import {useNavigation, useRouter} from "expo-router";
import {CommonActions} from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import axiosClient from "../../../../api/client";
import * as MediaLibrary from "expo-media-library";
import * as ImageManipulator from 'expo-image-manipulator';
import _ from "lodash";
import {ProductWorkflowContext} from "../../../../components/ProductWorkflowContext";
import {useQueryClient} from "react-query";
import {formatShippingRuleSummary} from "../../../../utils/formatShippingRuleSummary";
import {ShippingRuleSummary} from "../../../../components/ShippingRuleSummary";
import {useAddShippingRule} from "../../../../api/hooks/useAddShippingRule";
import {useAssignShippingRule} from "../../../../api/hooks/useAssignShippingRule";

const convertHeicToJpg = async (uri) => {
    try {
        const result = await ImageManipulator.manipulateAsync(uri, [], {
            compress: 1,
            format: ImageManipulator.SaveFormat.JPEG
        });
        console.log('Converted image:', result);
        return result.uri;
    } catch (error) {
        console.error('Image conversion error:', error);
    }
};

export default function Preview(props) {
    const dispatch = useDispatch();
    const router = useRouter();
    const theme = useTheme();
    const newProduct = useSelector((state) => state.newProduct);
    const shippingRule = useSelector((state) => state.shippingRule);
    const storeId = useSelector((state) => state.store.storeId); // Access the storeId from Redux
    const {isNewVariant, variantInfo, isClone, useSameMediaForClone, resetWorkflow, isPublishing, setIsPublishing, published, setPublished, publishFailure, setPublishFailure, mediaGalleryKey, setMediaGalleryKey} = useContext(ProductWorkflowContext);
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const {mutateAsync: addShippingRule} = useAddShippingRule(storeId);
    const {mutateAsync: associateRuleWithProduct} = useAssignShippingRule(storeId);
    const resetNavigationStack = (route, params) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {
                        name: route,
                        params: params || {},
                    }
                ],
            })
        );
    };

    async function publishProduct() {
        try {

            let updatedMediaItems;
            if ((!isNewVariant || (isNewVariant && !variantInfo.useSameMedia)) && (!isClone || (isClone && !useSameMediaForClone))) {
                // Generate fileKeys for each mediaItem
                const fileKeysWithContentTypes = newProduct.mediaItems.map((item) => ({
                    fileKey: `stores/${storeId}/products/${newProduct.productId}/${item.mediaId}`,
                    contentType: item.contentType === 'image/heic' ? 'image/jpg' : item.contentType
                }));
                console.log('f:', fileKeysWithContentTypes);
                const {data: presignedUrls} = await axiosClient.post(`/stores/${storeId}/mediaUploadPresignedUrls`, {
                    fileKeysWithContentTypes
                });
                console.log('fetched presigned urls');
                // Request presigned URLs for all mediaItems

                console.log('presignedUrls:', presignedUrls);

                updatedMediaItems = _.cloneDeep(newProduct.mediaItems);
                // Upload each mediaItem to Spaces
                console.log('uploading media');
                const P = await Promise.all(newProduct.mediaItems.map(async (item, index) => {
                    const presignedUrl = presignedUrls[index].presignedUrl;
                    console.log('pre:', presignedUrl);

                    // console.log('line66, blob:', blob);
                    // console.log('line89:, blob.type:', blob.type);

                    let convertedItemUri = null;
                    if (item.contentType === 'image/heic') {
                        convertedItemUri = await convertHeicToJpg(item.uri);
                        console.log('convertedItemUri:', convertedItemUri);
                        updatedMediaItems[index].contentType = 'image/jpg';
                    }

                    let blob;
                    if (convertedItemUri) {
                        console.log('computing blob of converted item');
                        let res = await fetch(convertedItemUri);
                        blob = await res.blob();
                        console.log('line 87, blob:', blob);
                    } else {
                        let assetInfo = await MediaLibrary.getAssetInfoAsync(item);
                        console.log('assetInfo:', assetInfo);
                        let res = await fetch(assetInfo.localUri || assetInfo.uri);
                        blob = await res.blob();
                        console.log('line 94, blob:', blob);
                    }


                    // Replace the local uri with the Spaces URI after upload
                    console.log('line 58,item.uri:', item.uri);
                    try {
                        let r = await fetch(presignedUrl, {
                            method: 'PUT', headers: {
                                'Content-Type': updatedMediaItems[index].contentType, // Update Content-Type based on your files
                                'x-amz-acl': 'public-read',
                            }, body: blob,
                        });
                        console.log('r:', r);
                        if (!r.ok) {
                            console.error('Failed to upload to Spaces:', r.statusText);
                            return {success: false, reason: `uploadError (${r.status})`};
                        }
                        // Update the mediaItem with its uploaded URI
                        updatedMediaItems[index].uri = presignedUrls[index].fileUri;
                        return {success: true};

                    } catch (err) {
                        console.log('err:', err);
                        return {success: false, reason: 'fetchPutError'};
                    }

                }));
                console.log('P:', JSON.stringify(P, null, 2));
                console.log('updatedMediaItems:', updatedMediaItems);
            } else {
                updatedMediaItems = newProduct.mediaItems;
            }

            let data = {...newProduct, mediaItems: updatedMediaItems}
            if (isNewVariant) {
                data.variantInfo = variantInfo;
            }

            // Add shipping info to data
            data.shipping = {
                shippingRuleChoice: shippingRule.shippingRuleChoice,
                newShippingRule: shippingRule.newShippingRule,
                selectedExistingShippingRuleId: shippingRule.selectedExistingShippingRuleId
            };


            // Send the updated product data to the backend
            console.log('inserting data into db');
            await axiosClient.post(`/stores/${storeId}/products/addNewProduct`, data);

            console.log('Product published successfully!');
            return true;
            // resetNewProduct()
        } catch (error) {
            console.error('Failed to publish product:', error);
            return false;
        }
    }

    const publish = () => {
        console.log('207 publish');
        setIsPublishing(true);
        publishProduct().then((success) => {
            setIsPublishing(false);
            setPublished(success);
            if (!success) {
                setPublishFailure(true);
                setTimeout(() => {
                    resetWorkflow();
                    router.replace('/Main/(tabs)/Dashboard');
                }, 2000);
            } else {
                setTimeout(async () => {
                    await queryClient.invalidateQueries(["merchantProduct", storeId, newProduct.productId]);
                    await queryClient.invalidateQueries("storeProducts");

                    console.log('resetting workflow');
                    resetWorkflow()
                    console.log("resetting new product slice's redux state");
                    dispatch(resetNewProduct());
                    console.log('resetting navigation stack');
                    await router.replace('/Main/(tabs)/AddNewProduct');
                    // Wait one animation frame
                    await new Promise(resolve => setTimeout(resolve, 100));
                    await router.replace(`/Main/(tabs)/Products/${newProduct.productId}`);
                    console.log('done resetting');

                }, 2000);

            }
        });
    }

    const saveAsDraft = () => {
        // save draft
        // reset redux new product to empty
        dispatch(resetNewProduct());
        resetWorkflow();
        resetNavigationStack("Dashboard");
    };

    const discard = () => {
        // reset redux new product to empty
        console.log("DISCARDING: redux product before reset:", newProduct);
        dispatch(resetNewProduct());
        console.log("AFTER DISCARDING: redux product before reset:", newProduct);
        resetWorkflow();
        resetNavigationStack("Dashboard");
    };

    return (<ScrollView
            style={{flex: 1, backgroundColor: theme.colors.surface, paddingHorizontal: 10, paddingVertical: 20}}>

        <View style={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>


            {!published && isPublishing &&
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 16, width: '100%', padding: 8, borderRadius: 8, justifyContent: 'center', backgroundColor: theme.colors.secondary}}>
            <ActivityIndicator animating={true} color={'white'} size={"large"} />
                    <Text variant={'titleMedium'} style={{marginLeft: 10, color: 'white'}}>Publishing product</Text>
                </View>
                }
            {published &&
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 16, width: '100%', padding: 8, borderRadius: 8, justifyContent: 'space-between', backgroundColor: theme.colors.softSuccess}}>
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                    <MaterialIcons name={'check'} size={28} color={theme.colors.black}/>
                    <Text variant={'titleMedium'} style={{marginLeft: 10, color: 'black'}}>Product Published</Text>
                    </View>
                    <Button onPress={() => {
                        navigation.popToTop();
                        setMediaGalleryKey(mediaGalleryKey+1);
                        router.replace('/Main/(tabs)/Products/' + newProduct.productId);
                        setTimeout(() => {
                            dispatch(resetNewProduct());
                            resetWorkflow();
                        }, 500);
                        }
                    }>
                        Go To Product
                    </Button>
                </View>
            }
            {publishFailure && !isPublishing &&
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 16, width: '100%', padding: 8, borderRadius: 8, justifyContent: 'center', backgroundColor: theme.colors.softError}}>
                <MaterialIcons name={'error'} color={theme.colors.black} size={28}/>
                <Text variant={'titleMedium'} style={{marginLeft: 10, color: 'black'}}>Failed to publish product</Text>
            </View>}
            <>

                {((!published && !isPublishing) || (publishFailure)) &&
                <View
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        marginTop: 8,
                        marginBottom: 16,
                    }}
                >
                    <Button
                        onPress={discard}
                        icon={"delete"}
                        mode={"contained"}
                        labelStyle={{color: "white"}}
                        style={{borderRadius: 8, backgroundColor: theme.colors.error}}
                    >
                        Discard
                    </Button>
                    <Button
                        onPress={publish}
                        mode={"contained"}
                        style={{ borderRadius: 8, backgroundColor: theme.colors.success }}
                    >
                        Publish
                    </Button>
                </View>}
                <ProductDisplayCardCustomerStore
                    product={newProduct}
                    showProductDescription={true}
                    showRating={true}
                />
                <Text variant={'titleMedium'} style={{marginTop: 16, marginBottom: 8}}>Shipping Rule For This Product</Text>
                {shippingRule.shippingRuleChoice === 'noShipping' ?
                    <Card style={{alignSelf: 'stretch', borderRadius: 0, backgroundColor: theme.colors.surface, padding: 16, marginVertical: 8}}>
                        <Text variant={'titleMedium'} style={{marginTop: 16, marginBottom: 8}}>No Shipping Required</Text>
                    </Card>
                    :
                <ShippingRuleSummary shippingRule={shippingRule.newShippingRule} />}

            </>
        </View>


        </ScrollView>);
}
