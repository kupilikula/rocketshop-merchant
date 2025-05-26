import React, {useState} from "react";
import {ListRenderItemInfo, Pressable, View, StyleSheet, Platform, FlatList} from "react-native";
import ReorderableList, {
    ReorderableListItem,
    ReorderableListReorderEvent,
    reorderItems,
    useReorderableDrag,
} from "react-native-reorderable-list";
import {Text, Surface, useTheme, Button, ActivityIndicator, Portal, Modal, Chip, Switch, RadioButton, Card} from "react-native-paper";
import { useRouter } from "expo-router";

import { useCollections } from "@/api/hooks/useCollections";
import { useUpdateCollectionOrder } from "@/api/hooks/useUpdateCollectionOrder";
import CollectionListItem from "../../../../components/CollectionListItem";
import {useSelector} from "react-redux";
import {AddNewCollectionModal} from '@/components/AddNewCollectionModal';
import {getCollectionPath} from "../../../../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web';

const CollectionItem =  (collection, drag = null)  => {
    const router = useRouter();

    return <Pressable
        onLongPress={drag}
        onPress={() => {
            router.push(
                getCollectionPath(collection.collectionId)
            );
        }}>
        <CollectionListItem collection={collection} onDelete={() => {
        }}/>
    </Pressable>
}


const ListElement = React.memo((collection) => {
    const drag = !IS_WEB ? useReorderableDrag() : null;

    return (
        !IS_WEB ?
        <ReorderableListItem>
            {CollectionItem(collection, drag)}
        </ReorderableListItem> :
            CollectionItem(collection)
    );
});

const CollectionsScreen = () => {
    const theme = useTheme();
    const router = useRouter();
    const {storeId} = useSelector((state) => state.store);
    const styles = makeStyles(theme, IS_WEB);

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

    const HeaderComponent =  <>
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

        {!IS_WEB && <Text variant={"bodyMedium"} style={{ marginLeft: 10 }}>
            Drag & drop to reorder
        </Text>}
    </>

    const mainContent = IS_WEB ?
        <FlatList
            style={{}}
            data={collections}
            renderItem={renderItem}
            keyExtractor={(item) => item.collectionId}
            ListHeaderComponent={HeaderComponent}
        />
        : <ReorderableList
        style={{}}
        data={collections}
        onReorder={handleReorder}
        renderItem={renderItem}
        keyExtractor={(item) => item.collectionId}
        ListHeaderComponent={HeaderComponent}
    />;

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
        <>
            {IS_WEB ? (
                <View style={styles.webPageContainer_Root}>
                    <View style={styles.webMaxContentContainer_Shell}>
                        {mainContent}
                    </View>
                </View>
            ) : (
                <View style={styles.mobileRootContainer}>
                    {mainContent}
                </View>
            )}
            <AddNewCollectionModal
                isVisible={showNewCollectionModal}
                onDismiss={() => setShowNewCollectionModal(false)}
                contentContainerStyle={IS_WEB ? styles.webModalContentContainer : undefined}
            />
        </>
    );
};

const makeStyles = (theme, isWeb) => StyleSheet.create({
    webPageContainer_Root: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center', // Centers the shell
    },
    webMaxContentContainer_Shell: {
        width: '100%',
        maxWidth: 768, // Max width for the list content
        flex: 1,
        backgroundColor: theme.colors.surface, // Match mobile content area bg
        paddingHorizontal: 10, // Match mobile root paddingHorizontal
        paddingVertical: isWeb ? 10 : 0,   // Add some vertical padding for web shell if needed
    },
    mobileRootContainer: { // For mobile's root View, replicating original inline style
        paddingHorizontal: 10,
        backgroundColor: theme.colors.surface,
        flex: 1,
    },
    loadingErrorContainer: { // Common for loading/error content itself
        flex: 1, // Takes full space of its parent (shell on web, root on mobile)
        justifyContent: "center",
        alignItems: "center",
        padding: 20, // Padding for the text/indicator
        // backgroundColor: theme.colors.surface, // Parent already has this
    },
    emptyListContainer: { // Style for ListEmptyComponent
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 20,
    },
    webModalContentContainer: { // For AddNewCollectionModal on web
        maxWidth: 500,
        width: '90%',
        // Modal itself usually centers this block
    },
    // Any other styles specific to this screen from an original StyleSheet.create can be added here.
    // Currently, the original screen didn't have a separate makeStyles function.
});

export default CollectionsScreen;