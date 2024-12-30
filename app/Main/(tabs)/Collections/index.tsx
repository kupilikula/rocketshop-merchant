import React from "react";
import { ListRenderItemInfo, Pressable, View } from "react-native";
import ReorderableList, {
    ReorderableListItem,
    ReorderableListReorderEvent,
    reorderItems,
    useReorderableDrag,
} from "react-native-reorderable-list";
import { Text, Surface, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCollections } from "../../../../hooks/useCollections";
import { useUpdateCollectionOrder } from "../../../../hooks/useUpdateCollectionOrder";
import CollectionListItem from "../../../../components/CollectionListItem";

interface ListElementProps {
    collectionId: string;
    collectionName: string;
    isActive: boolean;
}

const ListElement: React.FC<ListElementProps> = React.memo((collection) => {
    const drag = useReorderableDrag();
    const router = useRouter();

    return (
        <ReorderableListItem>
            <Pressable
                onLongPress={drag}
                onPress={() => {
                    router.push(
                        "/Main/(tabs)/Collections/Collection/" + collection.collectionId
                    );
                }}
            >
                <CollectionListItem collection={collection} onDelete={() => {}} />
            </Pressable>
        </ReorderableListItem>
    );
});

const CollectionsScreen = ({ storeId }) => {
    const theme = useTheme();
    const router = useRouter();

    // React Query: Fetch collections
    const { data: collections = [], isLoading, isError } = useCollections();

    // React Query: Mutation for updating order
    const { mutate: updateCollectionOrder } = useUpdateCollectionOrder(storeId);

    const handleReorder = ({ from, to }: ReorderableListReorderEvent) => {
        const newData = reorderItems(collections, from, to);
        // Optimistically update UI and send data to the backend
        updateCollectionOrder(newData);
    };

    const renderItem = ({ item }: ListRenderItemInfo<ListElementProps>) => (
        <ListElement {...item} />
    );

    let nActive = collections.filter((c) => c.isActive).length;
    let nInactive = collections.filter((c) => !c.isActive).length;

    if (isLoading) {
        return (
            <Surface
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.surface,
                }}
            >
                <Text>Loading collections...</Text>
            </Surface>
        );
    }

    if (isError) {
        return (
            <Surface
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.surface,
                }}
            >
                <Text>Error loading collections. Please try again.</Text>
            </Surface>
        );
    }

    return (
        <Surface
            style={{ paddingHorizontal: 10, backgroundColor: theme.colors.surface }}
        >
            <ReorderableList
                style={{}}
                data={collections}
                onReorder={handleReorder}
                renderItem={renderItem}
                keyExtractor={(item) => item.collectionId}
                ListHeaderComponent={
                    <>
                        <View style={{ marginVertical: 10 }}>
                            <View
                                style={{
                                    marginLeft: 8,
                                    marginTop: 8,
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                }}
                            >
                                <MaterialIcons
                                    name={"category"}
                                    size={44}
                                    color={theme.colors.primary}
                                    style={{}}
                                />
                                <Text
                                    variant={"displaySmall"}
                                    style={{ marginLeft: 10, color: theme.colors.secondary }}
                                >
                                    Collections
                                </Text>
                            </View>
                            <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                                {nActive.toString() +
                                    " Active Collection" +
                                    (nActive !== 1 ? "s" : "")}
                            </Text>
                            <Text variant={"bodyLarge"} style={{ marginLeft: 10 }}>
                                {nInactive.toString() +
                                    " Inactive Collection" +
                                    (nInactive !== 1 ? "s" : "")}
                            </Text>
                        </View>
                        <Text variant={"bodyMedium"} style={{ marginLeft: 10 }}>
                            Drag & drop to reorder
                        </Text>
                    </>
                }
            />
        </Surface>
    );
};

export default CollectionsScreen;