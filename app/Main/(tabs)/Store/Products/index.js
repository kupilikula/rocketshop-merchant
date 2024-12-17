import {FlatList, ScrollView} from "react-native";
import {Surface} from 'react-native-paper';
import ProductDisplayCardCustomerStore from "../../../../../components/ProductDisplayCardCustomerStore";
import {faker} from '@faker-js/faker';
import {getProductForStore} from "../../../../../utils/fakeDataMethods";

export default function Products () {
    const products = faker.helpers.multiple(getProductForStore, {count: 10});
    return <Surface mode={'flat'} style={{backgroundColor: 'white', height: '100%'}}>
        <FlatList data={products} renderItem={({item}) => <ProductDisplayCardCustomerStore product={item}/>}/>
    </Surface>
}