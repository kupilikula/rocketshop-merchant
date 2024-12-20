import React, {useState} from 'react';
import {ListRenderItemInfo, Pressable, StyleSheet, View} from 'react-native';
import ReorderableList, {
    ReorderableListItem,
    ReorderableListReorderEvent,
    reorderItems,
    useReorderableDrag,
} from 'react-native-reorderable-list';
import {Text, Card, Surface} from "react-native-paper";
import {faker} from "@faker-js/faker";
import {getCollection} from '@/utils/fakeDataMethods';
import CollectionListItem from '../../../../components/CollectionListItem';
import {useRouter} from "expo-router";
interface ListElementProps {
    collectionId: string;
    collectionName: string;
}
const collectionsList = faker.helpers.uniqueArray(getCollection, 15);


const ListElement: React.FC<ListElementProps> = React.memo((collection) => {
    const drag = useReorderableDrag();
    const router = useRouter();
    console.log(collection);
    return (
        <ReorderableListItem>
            <Pressable onLongPress={drag}>
                <CollectionListItem collection={collection} onEdit={() => {router.push('/Main/(tabs)/Collections/Collection/'+collection.collectionId)}} onDelete={() => {}}/>
            </Pressable>
        </ReorderableListItem>
    );
});

const CollectionsScreen = () => {
    const [data, setData] = useState(collectionsList);

    const renderItem = ({item}: ListRenderItemInfo<ListElementProps>) => (
        <ListElement {...item} />
    );

    const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
        const newData = reorderItems(data, from, to);
        setData(newData);
    };

    return (
        <Surface style={{padding: 10}}>
            <ReorderableList
                style={{}}
                data={data}
                onReorder={handleReorder}
                renderItem={renderItem}
                keyExtractor={item => item.collectionId}
                ListHeaderComponent={            <View>
                    <Text variant={'displaySmall'}>Collections</Text>
                    <Text variant={'bodyMedium'} style={{marginLeft: 10}}>Drag & drop to reorder</Text>
                </View>
                }
            />
        </Surface>
    );
};

const styles = StyleSheet.create({
    card: {
        // justifyContent: 'center',
        // alignItems: 'center',
        // margin: 6,
        // borderRadius: 5,
        // backgroundColor: 'green',
        borderWidth: 1,
        borderColor: '#ddd',
        height: 100
    },
    text: {
        fontSize: 20,
        color: 'black'
    },
});

export default CollectionsScreen;