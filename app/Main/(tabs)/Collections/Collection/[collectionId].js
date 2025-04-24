import React, { useState } from "react";
import {
    ActivityIndicator,
    Card,
    Chip,
    Divider,
    RadioButton,
    Surface,
    Switch,
    Text,
    useTheme,
} from "react-native-paper";
import { StyleSheet, Pressable, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ReorderableList, {
    ReorderableListItem,
    reorderItems,
    useReorderableDrag,
} from "react-native-reorderable-list";
import { ProductDisplayCompactMerchant } from "../../../../../components/ProductDisplayCompactMerchant";
import {useCollection} from "../../../../../api/hooks/useCollection";
import {useUpdateCollectionSettings} from "../../../../../api/hooks/useUpdateCollectionSettings";
import {useReorderCollectionProducts} from "../../../../../api/hooks/useReorderCollectionProducts";
import {useSelector} from "react-redux";
import {usePushWithBackHref} from "../../../../../utils/usePushWithBackHref";


const ListElement = React.memo((product) => {
    const drag = useReorderableDrag();
    const pushWithBackHref = usePushWithBackHref();

    return (
        <ReorderableListItem>
            <Pressable
                onLongPress={drag}
                onPress={() =>
                    pushWithBackHref("/Main/(tabs)/Products/" + product.productId)
                }
                style={{ marginVertical: 5 }}
            >
                <ProductDisplayCompactMerchant product={product} />
            </Pressable>
        </ReorderableListItem>
    );
});

export default function CollectionPage() {
    const { collectionId } = useLocalSearchParams();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const {storeId} = useSelector((state) => state.store);
    // React Query hooks
    const { data: collection, isLoading, isError } = useCollection(storeId, collectionId);
    const { mutate: updateSettings } = useUpdateCollectionSettings(storeId, collectionId);
    const { mutate: reorderProducts } = useReorderCollectionProducts(storeId, collectionId);

    const [productsData, setProductsData] = useState([]);

    // Update local state when data is fetched
    React.useEffect(() => {
        if (collection) {
            setProductsData(collection.products);
        }
    }, [collection]);

    const handleReorder = ({ from, to }) => {
        const newData = reorderItems(productsData, from, to);
        setProductsData(newData);

        // Send the reordered list to the backend
        reorderProducts(newData);
    };

    const handleToggleSettings = (key, value) => {
        updateSettings({ [key]: value });
    };

    const renderItem = ({ item }) => <ListElement {...item} />;

    const CollectionSettings = () => (
        <Card style={styles.card}>
            <View style={styles.statusContainer}>
                <Text variant={"titleMedium"} style={{ marginRight: 15 }}>
                    Collection Status
                </Text>
                <View style={{ display: "flex", flexDirection: "row" }}>
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
                        value={collection?.isActive}
                        onValueChange={(value) => handleToggleSettings("isActive", value)}
                        color={
                            collection?.isActive ? theme.colors.active : theme.colors.inactive
                        }
                    />
                </View>
            </View>
            <View style={styles.statusContainer}>
                <Text variant={"titleMedium"} style={{ marginRight: 15 }}>
                    Store Front Display
                </Text>
                <View style={{ display: "flex", flexDirection: "row" }}>
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
                        value={collection?.storeFrontDisplay}
                        onValueChange={(value) =>
                            handleToggleSettings("storeFrontDisplay", value)
                        }
                        color={
                            collection?.storeFrontDisplay
                                ? theme.colors.active
                                : theme.colors.inactive
                        }
                    />
                </View>
            </View>
            {collection?.storeFrontDisplay && (
                <View style={{ marginTop: 15 }}>
                    <Text variant={"titleMedium"}>Number of Items on Store Front</Text>
                        <RadioButton.Group
                            onValueChange={(value) =>
                                handleToggleSettings("storeFrontDisplayNumberOfItems", value)
                            }
                            value={collection?.storeFrontDisplayNumberOfItems}
                        >
                            <View style={styles.radioGroup}>
                                {[2, 4, 6, 8].map((number) => (
                                    <View key={number} style={styles.radioButtonContainer}>
                                        <RadioButton.Android value={number} color={theme.colors.primary} />
                                        <Text>{number.toString()}</Text>
                                    </View>
                                ))}
                            </View>
                        </RadioButton.Group>
                </View>
            )}
        </Card>
    );

    if (isLoading) {
        return <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.colors.surface,
            }}
        >
            <ActivityIndicator size={100} animating={true} color={theme.colors.primary} />
        </View>
    }

    if (isError) {
        return <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.colors.surface,
            }}
        >
            <Text variant={"titleLarge"}>Error loading collection.</Text>
        </View>;
    }

    return (
        <View style={styles.surface}>
            <ReorderableList
                data={productsData}
                onReorder={handleReorder}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <Divider style={{ marginVertical: 5 }} />}
                ListHeaderComponent={
                    <>
                        <View style={styles.header}>
                            <Text variant={"titleLarge"}>{collection?.collectionName}</Text>
                            <Text variant={"bodyLarge"}>
                                {collection?.products.length.toString()} Products
                            </Text>
                        </View>
                        <CollectionSettings />
                        <Text variant={"bodyLarge"}>Drag & Drop to Reorder Products</Text>
                    </>
                }
                keyExtractor={(item) => item.productId}
            />
        </View>
    );
}

const makeStyles = ({ colors }) =>
    StyleSheet.create({
        surface: {
            flex: 1,
            paddingHorizontal: 10,
            backgroundColor: colors.surface,
        },
        header: {
            width: "100%",
            padding: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
        },
        statusContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginVertical: 15,
        },
        card: {
            width: "100%",
            padding: 15,
            backgroundColor: "white",
            marginBottom: 20,
            borderRadius: 0,
        },
        radioButtonGroup: {
            display: "flex",
            flexDirection: "row",
            flexWrap: 'wrap',
        },
        radioButtonItem: {
            marginRight: 10,
        },
        radioGroup: {
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap", // Ensures wrapping if needed
        },
        radioButtonContainer: {
            flexDirection: "row",
            alignItems: "center",
            marginRight: 15,
        },
    });