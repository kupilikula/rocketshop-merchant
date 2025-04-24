import React, {useState} from "react";
import {ListRenderItemInfo, Pressable, View, StyleSheet} from "react-native";
import ReorderableList, {
    ReorderableListItem,
    ReorderableListReorderEvent,
    reorderItems,
    useReorderableDrag,
} from "react-native-reorderable-list";
import {Text, Surface, useTheme, Button, ActivityIndicator, Portal, Modal, Chip, Switch, RadioButton, Card} from "react-native-paper";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCollections } from "@/api/hooks/useCollections";
import { useUpdateCollectionOrder } from "@/api/hooks/useUpdateCollectionOrder";
import CollectionListItem from "../../../../components/CollectionListItem";
import {useSelector} from "react-redux";
import {AddNewCollectionModal} from '@/components/AddNewCollectionModal';

const ListElement = React.memo((collection) => {
    const drag = useReorderableDrag();
    const router = useRouter();

    return (
        <ReorderableListItem>
            <Pressable
                onLongPress={drag}
                onPress={() => {
                    router.push(
                        "/Main/(tabs)/Collections/" + collection.collectionId
                    );
                }}
            >
                <CollectionListItem collection={collection} onDelete={() => {}} />
            </Pressable>
        </ReorderableListItem>
    );
});

const CollectionsScreen = () => {
    const theme = useTheme();
    const router = useRouter();
    const {storeId} = useSelector((state) => state.store);

    // React Query: Fetch collections
    const { data: collections = [], isLoading, isError } = useCollections(storeId);

    // React Query: Mutation for updating order
    const { mutate: updateCollectionOrder } = useUpdateCollectionOrder(storeId);
    const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);

    const handleReorder = ({ from, to }) => {
        const newData = reorderItems(collections, from, to);
        // Optimistically update UI and send data to the backend
        updateCollectionOrder(newData);
    };

    const renderItem = ({ item }) => (
        <ListElement {...item} />
    );

    let nActive = collections.filter((c) => c.isActive).length;
    let nInactive = collections.filter((c) => !c.isActive).length;

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.surface,
                }}
            >
                <ActivityIndicator size={100} animating={true} color={theme.colors.primary} />
            </View>
        );
    }

    if (isError) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.surface,
                }}
            >
                <Text variant={"titleLarge"}>Error loading collections.</Text>
            </View>
        );
    }

    return (
        <View
            style={{ paddingHorizontal: 10, backgroundColor: theme.colors.surface, flex: 1 }}
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
                        <View style={{display: 'flex', flexDirection: 'row', alignSelf: 'center', marginVertical: 10}}>
                            <Button mode={'outlined'} onPress={() => setShowNewCollectionModal(true)} style={{borderColor: theme.colors.success}} labelStyle={{color: theme.colors.success}} icon={'plus'}>Add New Collection</Button>
                        </View>

                        <Text variant={"bodyMedium"} style={{ marginLeft: 10 }}>
                            Drag & drop to reorder
                        </Text>
                    </>
                }
            />
            <AddNewCollectionModal isVisible={showNewCollectionModal} onDismiss={() => setShowNewCollectionModal(false)}/>
        </View>
    );
};

export default CollectionsScreen;