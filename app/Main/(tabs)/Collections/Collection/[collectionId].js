import {Card, Surface} from "react-native-paper";
import {useLocalSearchParams, useRouter} from "expo-router";
import {Text} from 'react-native-paper';
import {FlatList, ListRenderItemInfo, Pressable, View} from "react-native";
import ProductDisplayCardCustomerStore from "../../../../../components/ProductDisplayCardCustomerStore";
import {faker} from "@faker-js/faker";
import {getCollection, getProductForStore} from "../../../../../utils/fakeDataMethods";
import {ProductDisplayCompactMerchant} from "../../../../../components/ProductDisplayCompactMerchant";
import ReorderableList, {
    ReorderableListItem,
    ReorderableListReorderEvent,
    reorderItems, useReorderableDrag
} from "react-native-reorderable-list";
import React, {useState} from "react";
import CollectionListItem from "../../../../../components/CollectionListItem";


const ListElement= React.memo((product) => {
    const drag = useReorderableDrag();
    // const router = useRouter();
    // console.log();
    return (
        <ReorderableListItem>
            <Pressable onLongPress={drag} style={{marginVertical: 5}}>
                <ProductDisplayCompactMerchant product={product}/>
            </Pressable>
        </ReorderableListItem>
    );
});
export default function CollectionPage(props) {

    const {collectionId} = useLocalSearchParams();
    // const products = faker.helpers.multiple(getProductForStore, {count: 10});
    const collection = getCollection();

    const [productsData, setProductsData] = useState(collection.products);
    const handleReorder = ({from, to}) => {
        const newData = reorderItems(productsData, from, to);
        setProductsData(newData);
    };
    const renderItem = ({item}) => (
        <ListElement {...item} />)


    return <Surface mode={'flat'} style={{backgroundColor: 'white', height: '100%', padding: 10}}>

        <ReorderableList
            style={{}}
            data={productsData}
            onReorder={handleReorder}
            renderItem={renderItem}
            ListHeaderComponent={        <View style={{ width: '100%', margin: 10}}>
                <Text variant={'titleLarge'}>{collection.collectionName}</Text>
            </View>}
            keyExtractor={item => item.productId}
        />

        {/*<FlatList*/}
        {/*    data={collection.products}*/}
        {/*    renderItem={({item}) => <ProductDisplayCompactMerchant product={item}/> }*/}
        {/*    ListHeaderComponent={        <View style={{ width: '100%', margin: 10}}>*/}
        {/*        <Text variant={'titleLarge'}>{collection.collectionName}</Text>*/}
        {/*    </View>}*/}
        {/*/>*/}
    </Surface>
}