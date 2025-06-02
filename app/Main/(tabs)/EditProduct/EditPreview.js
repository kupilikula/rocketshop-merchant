import {ActivityIndicator, ScrollView, View, Platform } from "react-native"; // Added Platform
import {Button, useTheme, Text} from "react-native-paper";
import ProductDisplayCardCustomerStore from "../../../../components/ProductDisplayCardCustomerStore"; // Ensure web-responsive
import {useDispatch, useSelector} from "react-redux";
import React, { useContext, useEffect} from "react";
import {resetEditProduct} from "../../../../store/editProductSlice";
import {useNavigation, useRouter} from "expo-router";
import {CommonActions} from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import {useSafeAreaInsets} from "react-native-safe-area-context"; // Not used in this component's render
import { getAxiosClient } from "../../../../api/client";
// import * as MediaLibrary from "expo-media-library"; // Imported but not used directly here
// import * as ImageManipulator from 'expo-image-manipulator'; // Imported but not used directly here
import _ from "lodash";
import {ProductWorkflowContext} from "../../../../components/ProductWorkflowContext";
import {useQueryClient} from "react-query";
import {ShippingRuleSummary} from "../../../../components/ShippingRuleSummary"; // Ensure web-responsive
import {useGetShippingRuleForProduct} from "../../../../api/hooks/useGetShippingRuleForProduct";
import {getDashboardPath, getProductPath, getProductsPath} from "../../../../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web'; // Define IS_WEB

export default function EditPreview(props) {
    const {
        resetWorkflow,
        // isNewProduct, // isNewProduct from context is not used directly, editProduct state implies it
        // productPreviewPublishRef, // Not used in this snippet
        isPublishing, setIsPublishing,
        published, setPublished,
        publishFailure, setPublishFailure,
        // setShouldResetStack, // Not used in this snippet
        // mediaGalleryKey, setMediaGalleryKey // Not used in this snippet
        shippingChanged // used for displaying correct shipping rule
    } = useContext(ProductWorkflowContext);

    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();
    const router = useRouter();
    const theme = useTheme();
    const editProduct = useSelector((state) => state.editProduct);
    const storeId = useSelector((state) => state.store.storeId);
    const {
        data: shippingRule, // This is the original rule before edits
        isLoading: isLoadingShippingRule // Renamed to avoid conflict if another isLoading is used
    } = useGetShippingRuleForProduct(editProduct.productId, storeId, { enabled: !!editProduct.productId && !!storeId }); // ensure IDs exist

    const queryClient = useQueryClient();
    const navigation = useNavigation();


    // const resetNavigationStack = (routeName) => { // Renamed param for clarity
    //     navigation.dispatch(CommonActions.reset({
    //         index: 0, routes: [{name: routeName}],
    //     }),);
    // };

    async function publishProductChanges() { // Renamed for clarity
        try {
            setIsPublishing(true); // Set publishing true at the start of the attempt
            // Send the updated product data to the backend
            await axiosClient.put(`/stores/${storeId}/products/${editProduct.productId}/editProduct`, editProduct);
            setPublished(true);
            setPublishFailure(false); // Explicitly set failure to false on success
            // Invalidate queries and navigate after success confirmation
            await queryClient.invalidateQueries(["merchantProduct", storeId, editProduct.productId]);
            await queryClient.invalidateQueries("storeProducts"); // Invalidate list of products

            // Navigate after a short delay to show success message
            setTimeout(() => {
                router.replace(getProductPath(editProduct.productId));
                resetWorkflow(); // This should also reset relevant editProduct state via context or dispatch
            }, 1500); // Reduced delay slightly

        } catch (error) {
            console.error('Failed to publish product:', error);
            setPublishFailure(true);
            setPublished(false); // Ensure published is false on failure
        } finally {
            setIsPublishing(false);
        }
    }

    const discardChanges = () => { // Renamed for clarity
        dispatch(resetEditProduct());
        // For web, resetting to a top-level route might be simpler
        // For native, resetting the stack to a specific tab's root screen
        if (IS_WEB) {
            router.replace(getDashboardPath()); // Adjust your web dashboard path
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Products' }], // Assuming 'Products' is a root tab name
                })
            );
            // Fallback or more specific native navigation if needed
            router.replace(getProductsPath());
        }
        resetWorkflow();
    };

    // Determine which shipping rule to display
    // If shippingChanged is true, it implies shippingRuleDraft exists and should be shown.
    // Otherwise, show the fetched original shippingRule.
    const displayShippingRule = shippingChanged ? editProduct.shippingRuleDraft : shippingRule;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.colors.surface }}
            contentContainerStyle={
                IS_WEB
                    ? { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 }
                    : { paddingHorizontal: 10, paddingVertical: 20 }
            }
        >
            <View style={ IS_WEB ? { width: '100%', maxWidth: 700, alignItems: 'center'} : {alignItems: 'center', display: 'flex', flexDirection: 'column'} }>

                {isPublishing && (
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 16, width: '100%', padding: 12, borderRadius: 8, justifyContent: 'center', backgroundColor: theme.colors.secondary }}>
                        <ActivityIndicator animating={true} color={'white'} size={IS_WEB ? "small" : "large"} style={{marginRight: IS_WEB ? 12 : 0}} />
                        <Text variant={'titleMedium'} style={{marginLeft: 10, color: 'white'}}>Publishing product...</Text>
                    </View>
                )}

                {!isPublishing && published && (
                    <View style={{display: 'flex', flexDirection: IS_WEB ? 'row' : 'column', alignItems: 'center', marginVertical: 16, width: '100%', padding: 12, borderRadius: 8, justifyContent: 'space-between', backgroundColor: theme.colors.softSuccess || '#d4edda' }}>
                        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                            <MaterialIcons name={'check-circle'} size={28} color={theme.colors.success || 'green'}/>
                            <Text variant={'titleMedium'} style={{marginLeft: 10, color: theme.colors.onSurface}}>Product Published Successfully!</Text>
                        </View>
                        <Button
                            onPress={async () => {
                                // Navigation logic already handled in publishProductChanges success
                                // This button could be "View Product" or "Done"
                                const webPath = `/manage/products/${editProduct.productId}`; // Adjust your web path
                                const nativePath = `/Main/(tabs)/Products/${editProduct.productId}`;
                                router.replace(IS_WEB ? webPath : nativePath);
                                resetWorkflow(); // Ensure workflow reset if not already handled
                            }}
                            style={ IS_WEB ? { marginTop: 0, marginLeft: 16 } : { marginTop: 8 }}
                            mode="contained"
                        >
                            View Product
                        </Button>
                    </View>
                )}

                {!isPublishing && publishFailure && (
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 16, width: '100%', padding: 12, borderRadius: 8, justifyContent: 'center', backgroundColor: theme.colors.softError || '#f8d7da' }}>
                        <MaterialIcons name={'error'} color={theme.colors.error || 'red'} size={28}/>
                        <Text variant={'titleMedium'} style={{marginLeft: 10, color: theme.colors.onErrorContainer || theme.colors.onSurface}}>Failed to publish product. Please try again.</Text>
                    </View>
                )}

                {/* Action Buttons: Show if not currently publishing AND (not successfully published OR publication failed) */}
                {!isPublishing && (!published || publishFailure) && (
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row-reverse",
                            justifyContent: "space-between",
                            width: "100%",
                            marginTop: 8,
                            marginBottom: 16,
                        }}
                    >
                        <Button
                            onPress={publishProductChanges} // Changed to new function name
                            mode={"contained"}
                            style={{ borderRadius: 8, backgroundColor: theme.colors.primary, ...(IS_WEB && { marginLeft: 8 }) }} // Use primary for publish
                            labelStyle={{color: theme.colors.onPrimary}} // Ensure text is visible
                            icon="publish"
                        >
                            Publish Changes
                        </Button>
                        <Button
                            onPress={discardChanges}
                            icon={"delete-outline"}
                            mode={"outlined"} // More conventional for discard/cancel
                            style={{borderRadius: 8, borderColor: theme.colors.error, ...(IS_WEB && { marginRight: 'auto' })}} // Error color for border
                            labelStyle={{color: theme.colors.error}}
                        >
                            Discard Changes
                        </Button>
                    </View>
                )}

                {/* Product Preview Card - ensure it's responsive */}
                <ProductDisplayCardCustomerStore
                    product={editProduct}
                    showProductDescription={true}
                    showRating={true}
                    // Consider passing a style prop for web if needed:
                    // style={IS_WEB ? { maxWidth: '100%', width: 600 } : {}}
                />

                {/* Shipping Rule Summary */}
                {(displayShippingRule || isLoadingShippingRule) && ( // Show section if there's a rule or it's loading
                    <View style={{alignSelf: 'stretch', marginTop: 24, padding: IS_WEB ? 16 : 0, borderWidth: IS_WEB ? 1 : 0, borderColor: IS_WEB ? theme.colors.outlineVariant : 'transparent', borderRadius: IS_WEB ? 8 : 0}}>
                        <Text variant={'titleMedium'} style={{marginBottom: 16, fontWeight: 'bold'}}>Shipping Configuration</Text>
                        {isLoadingShippingRule && !displayShippingRule && <ActivityIndicator />}
                        {!isLoadingShippingRule && displayShippingRule && <ShippingRuleSummary shippingRule={displayShippingRule} />}
                        {!isLoadingShippingRule && !displayShippingRule && <Text>No shipping rule configured for this product.</Text>}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}