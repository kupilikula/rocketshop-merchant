import {Card, Surface} from "react-native-paper";
import {useLocalSearchParams} from "expo-router";
import {Text} from 'react-native-paper';
import {FlatList, View} from "react-native";
import ProductDisplayCardCustomerStore from "../../../../../../components/ProductDisplayCardCustomerStore";
import {faker} from "@faker-js/faker";
import {getFakeCollection, getProductForStore} from "../../../../../../utils/fakeDataMethods";
export default function CollectionPage(props) {

    const {collectionId} = useLocalSearchParams();
    // const products = faker.helpers.multiple(getProductForStore, {count: 10});
    const collection = getFakeCollection();

    return <Surface mode={'flat'} style={{backgroundColor: 'white', height: '100%'}}>
        <View style={{ width: '100%', padding: 20, borderBottomWidth: 2, borderColor: '#cccccc'}}>
            <Text variant={'titleLarge'}>{collection.collectionName}</Text>
        </View>
        <FlatList data={collection.products} renderItem={({item}) => <ProductDisplayCardCustomerStore product={item}/> }/>
    </Surface>
}