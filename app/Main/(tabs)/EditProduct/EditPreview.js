import {ActivityIndicator, ScrollView, View} from "react-native";
import {Button, useTheme, Text} from "react-native-paper";
import ProductDisplayCardCustomerStore from "../../../../components/ProductDisplayCardCustomerStore";
import {useDispatch, useSelector} from "react-redux";
import React, { useContext, useEffect} from "react";
import {resetEditProduct} from "../../../../store/editProductSlice";
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
import {ShippingRuleSummary} from "../../../../components/ShippingRuleSummary";
import {useGetShippingRuleForProduct} from "../../../../api/hooks/useGetShippingRuleForProduct";

export default function EditPreview(props) {
    const {resetWorkflow, isNewProduct, productPreviewPublishRef, isPublishing, setIsPublishing, published, setPublished, publishFailure, setPublishFailure, setShouldResetStack, mediaGalleryKey, setMediaGalleryKey} = useContext(ProductWorkflowContext);
    const dispatch = useDispatch();
    const router = useRouter();
    const theme = useTheme();
    const editProduct = useSelector((state) => state.editProduct);
    const storeId = useSelector((state) => state.store.storeId); // Access the storeId from Redux
    const {
        data: shippingRule,
    } = useGetShippingRuleForProduct(editProduct.productId, storeId);
    const queryClient = useQueryClient();
    const navigation = useNavigation();
    const {shippingChanged} = useContext(ProductWorkflowContext);

    const resetNavigationStack = (route) => {
        // Reset the navigation stack to the Dashboard tab
        navigation.dispatch(CommonActions.reset({
            index: 0, routes: [{name: route}], // Replace with your Dashboard screen name
        }),);
    };

    async function publishProduct() {
        try {
            // Send the updated product data to the backend
            console.log('inserting data into db');
            await axiosClient.put(`/stores/${storeId}/products/${editProduct.productId}/editProduct`, editProduct);

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
            } else {
                setTimeout(async () => {
                    await queryClient.invalidateQueries(["merchantProduct", storeId, editProduct.productId]);
                    await queryClient.invalidateQueries("storeProducts");
                    router.replace('/Main/(tabs)/Products/' + editProduct.productId);
                    resetWorkflow()
                }, 2000);
            }

        });
    }

    const discard = () => {
        // reset redux new product to empty
        console.log("DISCARDING: redux product before reset:", editProduct);
        dispatch(resetEditProduct());
        console.log("AFTER DISCARDING: redux product before reset:", editProduct);
        resetNavigationStack("Dashboard");
        resetWorkflow();
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
                    <Button onPress={async () => {
                        navigation.popToTop();
                        await queryClient.invalidateQueries(["merchantProduct", storeId, editProduct.productId])
                        router.replace('/Main/(tabs)/Products/' + editProduct.productId);
                        setTimeout(() => {
                            dispatch(resetEditProduct());
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
                        Discard Changes
                    </Button>
                    <Button
                        onPress={publish}
                        mode={"contained"}
                        style={{ borderRadius: 8, backgroundColor: theme.colors.success }}
                    >
                        Publish Changes
                    </Button>
                </View>}
                <ProductDisplayCardCustomerStore
                    product={editProduct}
                    showProductDescription={true}
                    showRating={true}
                />
                <View style={{alignSelf: 'stretch', marginTop: 16}}>
                <Text variant={'titleMedium'} style={{marginBottom: 16}}>Shipping Rule</Text>
                {shippingChanged ? <ShippingRuleSummary shippingRule={editProduct.shippingRuleDraft} />:
                    <ShippingRuleSummary shippingRule={shippingRule} />
                }
                </View>
            </>
        </View>


        </ScrollView>);
}
