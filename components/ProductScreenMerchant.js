import React, { useState } from 'react';
import {View, StyleSheet, ScrollView as DefaultScrollView, Switch, Pressable, Platform, useWindowDimensions} from "react-native";
import {
    Card,
    Chip, FAB,
    IconButton, Menu,
    Text,
    useTheme,
} from "react-native-paper";
import FlatListSlider from "./MediaSlider/FlatListSlider";
import MediaItem from "./MediaSlider/MediaItem";
import { Rating } from "@kolking/react-native-rating";
import {useRouter} from "expo-router";
import { getAxiosClient } from "../api/client";
import {useDispatch, useSelector} from "react-redux";
import {useQueryClient} from "react-query";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import GenerateVariantModal from "./GenerateVariantModal";
import {updateField} from "../store/newProductSlice";
import MarkAsVariantModal from "./MarkAsVariantModal";
import CloneProductModal from "./CloneProductModal";
import {ProductReviewsList} from "./ProductReviews";
import ScrollableScreen from "./ScrollableScreen";
import GenericHeader from "./GenericHeader";
import ConfirmDeleteProductModal from "./ConfirmDeleteProductModal";
import {useGetShippingRuleForProduct} from "../api/hooks/useGetShippingRuleForProduct";
import {ShippingRuleSummary} from "./ShippingRuleSummary";
import {getProductPath} from "../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web';

export default function ProductScreenMerchant(props) {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const {storeId} = useSelector((state) => state.store);
    const { width: windowWidth } = useWindowDimensions();
    const styles = makeStyles(theme, IS_WEB, windowWidth);
    const axiosClient = getAxiosClient();

    const [generateVariantModalVisible, setGenerateVariantModalVisible] = useState(false);
    const [markAsVariantModalVisible, setMarkAsVariantModalVisible] = useState(false);
    const [isCloneModalVisible, setIsCloneModalVisible] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [deleteProductModal, setDeleteProductModal] = useState(false);
    const {data: shippingRule} = useGetShippingRuleForProduct(props.product.productId, storeId);
    const [isActive, setIsActive] = useState(props.product.isActive);

    const handleFabToggle = () => setFabOpen(!fabOpen);

    const handleStatusChange = async (status) => {
        setIsActive(status);
        await axiosClient.put(`/stores/${storeId}/products/${props.product.productId}/editProduct`, {isActive: status});
        await queryClient.invalidateQueries(["merchantProduct", storeId, props.product.productId]);
    };

    // ... other handlers (handleGenerateVariant, submitCloneProduct, etc. remain unchanged) ...
    const handleGenerateVariant = () => {
        setFabOpen(false);
        setGenerateVariantModalVisible(true);
    };
    const handleGenerateVariantModalClose = () => setGenerateVariantModalVisible(false);
    const handleGenerateVariantSubmit = (differingAttributes, useSameMedia) => {
        const updatedAttributes = props.product.attributes.map((attr) => {
            const differingAttr = differingAttributes.find((diff) => diff.key === attr.key);
            return differingAttr ? { key: attr.key, value: differingAttr.value } : attr;
        });
        const prePopulatedData = {
            ...props.product,
            collections: props.product.collections.map((c) => c.collectionId),
            attributes: updatedAttributes,
            mediaItems: useSameMedia ? props.product.mediaItems : [],
        };
        delete prePopulatedData.productId;
        delete prePopulatedData.variants;
        dispatch(updateField({ field: "all", value: prePopulatedData }));
        router.push({
            pathname: "/Main/(tabs)/AddNewProduct",
            params: {  isNewVariant: true, useSameMedia, parentProductId: props.product.productId, differingAttributes: JSON.stringify(differingAttributes) },
        });
        setGenerateVariantModalVisible(false);
    };

    const computeDifferingAttributes = (product1, product2) => {
        const attributes1 =product1.attributes || [];
        const attributes2 = product2.attributes || [];
        return attributes1.filter((attr) => !attributes2.some((attr2) => attr.key === attr2.key && attr.value === attr2.value));
    };
    const submitMarkAsVariant = async (productId, parentProductId, differingAttributes) => {
        try {
            await axiosClient.post(`/stores/${storeId}/products/markAsVariant`, {productId, parentProductId, differingAttributes})
            await Promise.all([queryClient.invalidateQueries(["merchantProduct", storeId, productId]), queryClient.invalidateQueries(["merchantProduct", storeId, parentProductId]) ])
        } catch (err) { console.error(err); alert("An error occurred while marking the product as a variant."); }
    };
    const handleMarkAsVariantProductSelect = (selectedProduct) => {
        setMarkAsVariantModalVisible(false);
        const differingAttributes = computeDifferingAttributes(props.product, selectedProduct);
        if (differingAttributes.length === 0) { alert("Products must differ in at least one attribute."); return; }
        submitMarkAsVariant(props.product.productId, selectedProduct.productId, differingAttributes);
    };
    const handleMarkAsVariant = () => {
        setFabOpen(false);
        setMarkAsVariantModalVisible(true);
    };

    const handleCloneProduct = () => {
        setFabOpen(false);
        setIsCloneModalVisible(true);
    };
    const submitCloneProduct = (useSameMedia) => {
        const prePopulatedData = {
            ...props.product,
            collections: props.product.collections.map((c) => c.collectionId),
            mediaItems: useSameMedia ? props.product.mediaItems : [],
        };
        delete prePopulatedData.productId;
        delete prePopulatedData.variants;
        dispatch(updateField({ field: "all", value: prePopulatedData }));
        router.push({
            pathname: "/Main/(tabs)/AddNewProduct",
            params: {  isClone: true, useSameMediaForClone: useSameMedia },
        });
        setIsCloneModalVisible(false);
    };


    const renderPageContent = () => ( // This content goes inside the scrollable area
        <>
            <Card mode={"contained"} style={styles.card}> {/* Use styles.card */}
                <FlatListSlider
                    data={props.product.mediaItems}
                    local={false}
                    orientation={"landscape"}
                    separator={0}
                    currentIndexCallback={(index) => console.log("Index", index)}
                    keyExtractor={(item) => item.mediaId}
                    indicator
                    indicatorStyle={{}}
                    indicatorContainerStyle={{ position: "absolute", bottom: 10 }}
                    indicatorActiveColor="#3498db"
                    indicatorInActiveColor="#bdc3c7"
                    indicatorActiveWidth={6}
                    flatListWrapperStyle={{ backgroundColor: "black", width: "100%", aspectRatio: (props.orientation === "portrait" ? "0.8" : "1.33") || "1.33" }}
                    allowPanZoom={false}
                    component={<MediaItem />}
                />
                <Card.Content style={styles.cardContent}>
                    <Text variant={"titleLarge"} style={styles.titleTextStyle}>
                        {props.product.productName}
                    </Text>
                    <View style={styles.cardContentView}>
                        <View style={styles.actionContainer}>
                            <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center"}}>
                                <IconButton
                                    icon="delete"
                                    size={28}
                                    onPress={() => setDeleteProductModal(true)}
                                    style={styles.actionButton}
                                    iconColor={theme.colors.error}
                                />
                            </View>
                            <View style={styles.statusContainer}>
                                <Switch value={isActive} onValueChange={handleStatusChange} />
                                <Chip
                                    textStyle={{ color: "black", textAlign: "center" }}
                                    style={{ marginLeft: 10, backgroundColor: isActive ? theme.colors.active : theme.colors.inactive }}
                                >
                                    {isActive ? "Active" : "Inactive"}
                                </Chip>
                            </View>
                        </View>
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
                            <View>
                                <Text variant="titleMedium">{"Price: ₹" + props.product.price.toString()}</Text>
                                <Text variant="titleMedium">{"Stock: " + props.product.stock.toString()}</Text>
                            </View>
                        </View>
                        <View style={styles.gstContainer}>
                            <Text>{"GST Rate: " + props.product.gstRate + "%"}</Text>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: 10 }}>
                            {props.product.attributes.map((a, i) => (
                                <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }} key={i.toString()}>
                                    <Text variant={"titleMedium"}>{a.key + ": "}</Text>
                                    <Text variant={"titleMedium"}>{a.value}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    {props.product.numberOfRatings > 0 && (
                        <View style={styles.rating}>
                            <Rating disabled={true} variant={"stars-outline"} fillColor={"#faaf00"} baseColor={"black"} size={18} rating={props.product.rating} onChange={() => {}}/>
                            <Text style={styles.ratingText} variant={"bodyLarge"}>
                                {props.product.rating.toString() + "/5 " + "(" + props.product.numberOfRatings.toString() + ")"}
                            </Text>
                        </View>
                    )}
                    {props.product.variants?.length > 0 && (
                        <>
                            <Text variant="titleMedium" style={{marginVertical: 8}}>Variants</Text>
                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", flexWrap: "wrap" }}>
                                {props.product.variants.map((v) => (
                                    <Pressable
                                        key={v.productId}
                                        style={{ alignSelf: "flex-start", marginRight: 8, marginVertical: 4 }}
                                        onPress={() => router.push(getProductPath(v.productId))}
                                    >
                                        <View style={{ display: "flex", alignItems: "center", padding: 8, borderRadius: 8, backgroundColor: theme.colors.softPrimary, borderWidth: 1 }}>
                                            {v.differingAttributes.map((a, index) => (
                                                <View key={index} style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                                                    <Text variant="titleSmall">{a.key + ": "}</Text>
                                                    <Text variant="titleSmall">{a.value}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </>
                    )}
                    <View style={{ marginTop: 10 }}>
                        <Text variant={"bodyLarge"} style={{ color: "black" }}>{props.product.description}</Text>
                    </View>
                    <View style={{ marginTop: 15 }}>
                        <Text variant={"titleMedium"} style={{ marginBottom: 10 }}>Collections:</Text>
                        <View style={styles.collectionsContainer}>
                            {props.product.collections.map((c) => (
                                <View style={{ display: "flex", flexDirection: "row", margin: 5 }} key={c.collectionId}>
                                    <Chip textStyle={{ color: "white" }} style={{ backgroundColor: theme.colors.primary }}>
                                        {c.collectionName}
                                    </Chip>
                                </View>
                            ))}
                        </View>
                    </View>
                    <Text variant={"titleMedium"} style={{ marginTop: 10 }}>Tags:</Text>
                    <View style={styles.tagsContainer}>
                        {props.product.productTags.map((tag) => (
                            <Chip key={tag} style={styles.tagChipSelected} textStyle={{ color: theme.colors.white }}>
                                {tag}
                            </Chip>
                        ))}
                    </View>
                    <ProductReviewsList productId={props.product.productId} />
                    {shippingRule && (
                        <View>
                            <Text variant={"titleMedium"} style={{ marginVertical: 10 }}>Shipping Cost Rule</Text>
                            <ShippingRuleSummary shippingRule={shippingRule}/>
                        </View>
                    )}
                </Card.Content>
            </Card>
            <ConfirmDeleteProductModal
                visible={deleteProductModal}
                onDismiss={() => setDeleteProductModal(false)}
                productId={props.product.productId}
            />
        </>
    );


    const headerComponent = (
        <GenericHeader
            title={'Product Details'}
            right={
                <IconButton
                    icon="pencil"
                    size={28}
                    onPress={() => router.push({pathname: '/Main/(tabs)/EditProduct', params: { productId: props.product.productId, backHref: `/Main/(tabs)/Products/${props.product.productId}`} } )}
                    style={styles.actionButton}
                    iconColor={theme.colors.black}
                />
            }
            // For web, if header is inside a constrained view, it might not need specific web styles unless it has full-width elements internally
            // style={IS_WEB ? styles.webHeader : {}} // Optional: if GenericHeader needs specific styling for web
        />
    );

    const fabAndMenuComponent = (
        <View style={styles.fabContainer}>
            <Menu
                visible={fabOpen}
                onDismiss={() => setFabOpen(false)}
                style={styles.menu}
                contentStyle={{backgroundColor: theme.colors.softSecondary}}
                mode={'elevated'}
                anchor={
                    <FAB
                        icon={fabOpen ? "close" : "plus"}
                        color={'white'}
                        style={styles.fab}
                        onPress={handleFabToggle}
                    />
                }
            >
                <Menu.Item onPress={handleCloneProduct} title="Clone Product" leadingIcon={({size, color}) => <MaterialIcons name={'file-copy'} size={size} color={color}/>} />
                <Menu.Item onPress={handleGenerateVariant} title="Generate Variant" leadingIcon="plus-circle"/>
                <Menu.Item onPress={handleMarkAsVariant} title="Mark as Variant" leadingIcon="palette-swatch-variant"/>
            </Menu>
        </View>
    );


    return (
        <>
            {IS_WEB ? (
                <View style={styles.webPageContainer_Root}>
                    <View style={styles.webContentShell_MaxWidth}>
                        {headerComponent}
                        <DefaultScrollView
                            style={styles.webScrollView_InsideShell}
                            contentContainerStyle={styles.webScrollViewContentContainer_InsideShell}
                            keyboardShouldPersistTaps="handled"
                        >
                            {renderPageContent()}
                        </DefaultScrollView>
                        {fabAndMenuComponent}
                    </View>
                </View>
            ) : (
                // Mobile structure remains identical to original
                <>
                    {headerComponent}
                    <ScrollableScreen innerStyle={styles.container}>
                        {renderPageContent()}
                    </ScrollableScreen>
                    {fabAndMenuComponent}
                </>
            )}

            {/* Modals are kept at the root fragment level as they usually portal themselves */}
            <GenerateVariantModal
                visible={generateVariantModalVisible}
                onClose={handleGenerateVariantModalClose}
                product={props.product}
                onGenerate={handleGenerateVariantSubmit}
                contentContainerStyle={IS_WEB ? styles.webModalContentContainer : undefined}
            />
            <MarkAsVariantModal
                visible={markAsVariantModalVisible}
                onClose={() => setMarkAsVariantModalVisible(false)}
                onProductSelect={handleMarkAsVariantProductSelect}
                contentContainerStyle={IS_WEB ? styles.webModalContentContainer : undefined}

                    />
            <CloneProductModal
                visible={isCloneModalVisible}
                onClose={() => setIsCloneModalVisible(false)}
                onConfirm={submitCloneProduct}
                contentContainerStyle={IS_WEB ? styles.webModalContentContainer : undefined}

            />
        </>
    );
}

const makeStyles = (theme, isWeb, windowWidth) =>
    StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        card: { /* ... same as original ... */
            position: "relative", width: "100%", borderRadius: 0, backgroundColor: "white", overflow: "hidden",
        },
        titleTextStyle: { /* ... same as original ... */
            color: "black", paddingLeft: 0, marginLeft: 0, marginTop: 10,
        },
        cardContent: { /* ... same as original ... */
            backgroundColor: "white",
        },
        cardContentView: { /* ... same as original ... */
            width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-start", marginTop: 10, position: "relative",
        },
        rating: { /* ... same as original ... */
            marginTop: 15, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start",
        },
        ratingText: { /* ... same as original ... */
            marginLeft: 10,
        },
        actionButton: { /* ... same as original ... */
            marginBottom: 10,
        },
        collectionsContainer: { flexDirection: "row", flexWrap: "wrap" },
        tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10, },
        chip: { margin: 5 },
        gstContainer: { marginTop: 10, fontSize: 12, color: "gray" },
        actionContainer: { /* ... same as original ... */
            position: "absolute", right: 0, top: 0, flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end",
        },
        statusContainer: { /* ... same as original ... */
            flexDirection: "row", justifyContent: "flex-end", alignItems: "center",
        },
        tagChipSelected: { /* ... same as original ... */
            margin: 5, backgroundColor: theme.colors.secondary,
        },
        container: { // For Mobile ScrollableScreen innerStyle
            flex: 1,
            position: "relative",
            backgroundColor: theme.colors.surface,
        },
        fabContainer: { /* ... same as original ... */
            position: "absolute", bottom: 16, right: 16, zIndex: 10, // Ensure zIndex for web too
        },
        fab: { /* ... same as original ... */
            backgroundColor: theme.colors.secondary,
        },
        menu: { /* ... same as original, adding borderRadius for consistency ... */
            backgroundColor: theme.colors.softSecondary, borderRadius: 8,
        },
        // --- Styles defined in original but not used in provided JSX (kept for completeness) ---
        actionButtonsContainer: { display: "flex", flexDirection: "row", alignItems: "center", alignContent: "center",},
        toggleButtons: { flexDirection: "row", justifyContent: "space-evenly", width: "100%",},
        toggleButton: { borderRadius: 0, width: "50%",},
        archiveButton: { marginTop: 20, alignSelf: "center" },


        // --- New Web Layout Styles ---
        webPageContainer_Root: { // Outermost full-browser-width container
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center', // Centers the webContentShell_MaxWidth
        },
        webContentShell_MaxWidth: { // The shell that has maxWidth
            width: '100%',
            maxWidth: 900, // As requested
            flex: 1, // Takes available vertical space
            backgroundColor: theme.colors.surface, // Background for the content area, matches mobile ScrollableScreen
            position: 'relative', // For absolute positioning of FAB within this shell
            flexDirection: 'column', // Header, ScrollView, FAB will stack vertically
        },
        webScrollView_InsideShell: { // The ScrollView within the max-width shell
            width: '100%',
            flex: 1, // Allows ScrollView to take remaining space after header
        },
        webScrollViewContentContainer_InsideShell: { // Content container for the web's ScrollView
            paddingHorizontal: isWeb ? 20 : 0, // Inner padding for the content
            paddingVertical: isWeb ? 20 : 0,   // Inner padding for the content
            flexGrow: 1,
            // No maxWidth or alignSelf needed here, parent shell handles it
            // position: "relative", // Inherited from webContentShell_MaxWidth or default
        },
        webModalContentContainer: {
            maxWidth: 550,      // Set a max-width for modals on web (e.g., 550px)
            width: '90%',       // Make modal width responsive, up to the maxWidth
            // alignSelf: 'center', // Paper's Modal usually centers its content container.
            // This can be an extra assurance if needed.
            // backgroundColor: theme.colors.background, // Usually set by the Card inside the modal
            // borderRadius: theme.roundness * 2,      // Usually set by the Card inside the modal
            // padding: 0, // Padding is usually on the Card inside the Modal, not the container itself.
        },
    });