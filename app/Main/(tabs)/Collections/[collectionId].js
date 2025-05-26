import React, { useState, useEffect, useMemo } from "react"; // Added useEffect, useMemo
import {
    ActivityIndicator,
    Card,
    Chip,
    Divider,
    RadioButton,
    Switch, // Switch was missing from imports
    Text,
    useTheme,
    Button, // Button was used in ListHeader but not imported
} from "react-native-paper";
import { StyleSheet, Pressable, View, Platform, FlatList as DefaultFlatList } from "react-native"; // Added Platform, DefaultFlatList
import { useRouter, useLocalSearchParams } from "expo-router";
import ReorderableList, {
    ReorderableListItem,
    reorderItems,
    useReorderableDrag,
} from "react-native-reorderable-list";
import { ProductDisplayCompactMerchant } from "../../../../components/ProductDisplayCompactMerchant";
import { useCollection } from "../../../../api/hooks/useCollection";
import { useUpdateCollectionSettings } from "../../../../api/hooks/useUpdateCollectionSettings";
import { useReorderCollectionProducts } from "../../../../api/hooks/useReorderCollectionProducts";
import { useSelector } from "react-redux";
import { usePushWithBackHref } from "../../../../utils/usePushWithBackHref";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {getProductPath} from "../../../../utils/getPathUtils"; // For error icon

const IS_WEB = Platform.OS === 'web';

// Mobile-specific list item with drag capabilities
const MobileListElement = React.memo((props) => { // props is the product item
    const dragHook = useReorderableDrag();
    const pushWithBackHref = usePushWithBackHref();

    return (
        <ReorderableListItem>
            <Pressable
                onLongPress={dragHook.onLongPress}
                disabled={dragHook.isActive}
                onPress={() =>
                    pushWithBackHref(getProductPath(props.productId))
                }
                style={{ marginVertical: 5 }} // Original style
            >
                <ProductDisplayCompactMerchant product={props} />
            </Pressable>
        </ReorderableListItem>
    );
});

// Web-specific list item (no drag)
const WebListElement = React.memo(({ item }) => { // Explicitly take item as a prop
    const pushWithBackHref = usePushWithBackHref();
    return (
        <Pressable
            onPress={() =>
                pushWithBackHref(getProductPath(item.productId))
            }
            style={{ marginVertical: 5 }} // Original style
        >
            <ProductDisplayCompactMerchant product={item} />
        </Pressable>
    );
});


export default function CollectionPage() {
    const { collectionId } = useLocalSearchParams();
    const theme = useTheme();
    const styles = makeStyles(theme, IS_WEB); // Pass IS_WEB to makeStyles
    const { storeId } = useSelector((state) => state.store);

    const { data: collection, isLoading, isError } = useCollection(storeId, collectionId);
    const { mutate: updateSettings } = useUpdateCollectionSettings(storeId, collectionId);
    const { mutate: reorderProducts } = useReorderCollectionProducts(storeId, collectionId);

    const [productsData, setProductsData] = useState([]);

    useEffect(() => {
        if (collection && collection.products) {
            setProductsData(collection.products);
        } else if (collection && !collection.products) {
            setProductsData([]);
        }
    }, [collection]);

    const handleReorder = ({ from, to }) => {
        const newData = reorderItems(productsData, from, to);
        setProductsData(newData); // Optimistic UI update
        // Prepare data for backend (e.g., array of product IDs in new order or objects with ID and new displayOrder)
        const reorderedProductIdsWithOrder = newData.map((product, index) => ({
            productId: product.productId,
            displayOrder: index // Or whatever backend expects
        }));
        reorderProducts(reorderedProductIdsWithOrder);
    };

    const handleToggleSettings = (key, value) => {
        updateSettings({ [key]: value });
    };

    const renderMobileItem = ({ item }) => <MobileListElement {...item} />;
    const renderWebItem = ({ item }) => <WebListElement item={item} />;

    // CollectionSettings component remains as defined in original, using styles from makeStyles
    const CollectionSettings = () => (
        <Card style={styles.card}>
            <View style={styles.statusContainer}>
                <Text variant={"titleMedium"} style={{ marginRight: 15 }}>
                    Collection Status
                </Text>
                <View style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                    <Chip
                        textStyle={{ color: "black", textAlign: "center" }}
                        style={{
                            marginRight: 10,
                            backgroundColor: collection?.isActive
                                ? theme.colors.active
                                : theme.colors.inactive,
                        }}
                    >
                        {collection?.isActive ? "Active" : "Inactive"}
                    </Chip>
                    <Switch
                        value={collection?.isActive || false}
                        onValueChange={(value) => handleToggleSettings("isActive", value)}
                        color={theme.colors.primary} // Use a consistent theme color for Switch
                    />
                </View>
            </View>
            <View style={styles.statusContainer}>
                <Text variant={"titleMedium"} style={{ marginRight: 15 }}>
                    Store Front Display
                </Text>
                <View style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                    <Chip
                        textStyle={{ color: "black", textAlign: "center" }}
                        style={{
                            marginRight: 10,
                            backgroundColor: collection?.storeFrontDisplay
                                ? theme.colors.active
                                : theme.colors.inactive,
                        }}
                    >
                        {collection?.storeFrontDisplay ? "Enabled" : "Disabled"}
                    </Chip>
                    <Switch
                        value={collection?.storeFrontDisplay || false}
                        onValueChange={(value) =>
                            handleToggleSettings("storeFrontDisplay", value)
                        }
                        color={theme.colors.primary}
                    />
                </View>
            </View>
            {collection?.storeFrontDisplay && (
                <View style={{ marginTop: 15 }}>
                    <Text variant={"titleMedium"}>Number of Items on Store Front</Text>
                    <RadioButton.Group
                        onValueChange={(value) =>
                            handleToggleSettings("storeFrontDisplayNumberOfItems", parseInt(value, 10))
                        }
                        value={collection?.storeFrontDisplayNumberOfItems?.toString()}
                    >
                        <View style={styles.radioGroup}>
                            {[2, 4, 6, 8].map((number) => (
                                <View key={number} style={styles.radioButtonContainer}>
                                    <RadioButton.Android value={number.toString()} color={theme.colors.primary} />
                                    <Text>{number.toString()}</Text>
                                </View>
                            ))}
                        </View>
                    </RadioButton.Group>
                </View>
            )}
        </Card>
    );

    const listHeaderComponent = (
        <>
            <View style={styles.header}>
                <Text variant={"titleLarge"}>{collection?.collectionName || "Collection"}</Text>
                <Text variant={"bodyLarge"}>
                    {(productsData?.length || 0).toString()} Product{(productsData?.length || 0) !== 1 ? 's' : ''}
                </Text>
            </View>
            <CollectionSettings />
            {!IS_WEB && (
                <Text variant={"bodyMedium"} style={{ paddingHorizontal:10, marginBottom: 10, fontStyle: 'italic' }}>
                    Drag & Drop to Reorder Products
                </Text>
            )}
        </>
    );

    const loadingErrorContent = (message, isErrorState = false) => (
        // This content will be wrapped by platform-specific root containers
        <View style={styles.loadingErrorContainer}>
            {isErrorState && <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} style={{ marginBottom: 10 }} />}
            {!isErrorState && <ActivityIndicator size={IS_WEB ? "large" : 100} color={theme.colors.primary} style={{ marginBottom: 10 }}/>}
            <Text variant={isErrorState ? "titleLarge" : "bodyLarge"}>{message}</Text>
        </View>
    );

    if (isLoading) {
        const loadingView = loadingErrorContent("Loading collection...");
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webMaxContentContainer_Shell}>{loadingView}</View></View>
            : <View style={styles.surface}>{loadingView}</View>; // Mobile uses styles.surface as root for loading/error
    }

    if (isError || !collection) {
        const errorView = loadingErrorContent(collection ? "Error loading collection." : "Collection not found.", true);
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webMaxContentContainer_Shell}>{errorView}</View></View>
            : <View style={styles.surface}>{errorView}</View>;
    }

    const mainListContent = IS_WEB ? (
        <DefaultFlatList
            data={productsData}
            renderItem={renderWebItem}
            keyExtractor={(item) => item.productId}
            ListHeaderComponent={listHeaderComponent}
            ItemSeparatorComponent={() => <Divider style={{ marginVertical: 5 }} />}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }} // Matches original ReorderableList
            ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                    <Text>No products in this collection yet.</Text>
                </View>
            }
        />
    ) : (
        <ReorderableList
            data={productsData}
            onReorder={handleReorder}
            renderItem={renderMobileItem}
            ItemSeparatorComponent={() => <Divider style={{ marginVertical: 5 }} />}
            ListHeaderComponent={listHeaderComponent}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }} // Matches original
        />
    );

    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer_Root}>
                <View style={styles.webMaxContentContainer_Shell}>
                    {mainListContent}
                </View>
            </View>
        );
    } else {
        return (
            <View style={styles.surface}> {/* Original mobile root container */}
                {mainListContent}
            </View>
        );
    }
}

const makeStyles = (theme, isWeb) => {
    const { colors } = theme;
    return StyleSheet.create({
        // --- Original Mobile Styles (EXACTLY as provided by user) ---
        surface: {
            flex: 1,
            backgroundColor: colors.surface,
            // paddingHorizontal: 10, // This was in the original root View inline, applied by webMaxContentContainer_Shell for web
            // and directly on mobileRootContainer if we make one, or contentContainerStyle of list.
            // The original root <View> for mobile had paddingHorizontal:10.
        },
        header: {
            width: "100%",
            padding: 10, // Original padding
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // Original alignment
        },
        statusContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginVertical: 15, // Original margin
        },
        card: { // For CollectionSettings
            width: "100%",
            padding: 15, // Original padding
            backgroundColor: "white",
            marginBottom: 20, // Original margin
            borderRadius: 0, // Original borderRadius
        },
        radioGroup: {
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
        },
        radioButtonContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginRight: 15,
        },
        // Styles for loading/error state's inner content
        loadingErrorContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20, // Padding for the text/indicator
            // backgroundColor is handled by the parent (styles.surface or webMaxContentContainer_Shell)
        },
        emptyListContainer: {
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            marginTop: 20,
        },

        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
        },
        webMaxContentContainer_Shell: {
            width: '100%',
            maxWidth: 768,
            flex: 1,
            backgroundColor: colors.surface, // Match mobile surface background
            paddingHorizontal: 10, // Match mobile surface paddingHorizontal
            // Add vertical padding for the shell on web if desired, or let list content handle it
            paddingVertical: IS_WEB ? 10 : 0,
        },
        webModalContentContainer: { // For AddNewCollectionModal on web
            maxWidth: 500,
            width: '90%',
        },
    });
};