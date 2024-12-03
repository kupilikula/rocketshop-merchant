import {FlatList, ScrollView} from "react-native";
import {Surface} from "react-native-paper";
import ProductDisplayCardCustomerFeed from "../../components/ProductDisplayCardCustomerFeed";
import { faker } from '@faker-js/faker';
import {getProductForCustomerFeed} from "../../utils/fakeDataMethods";

const products = faker.helpers.multiple(getProductForCustomerFeed, { count: 10});

export default function Feed () {


    return <Surface mode={'flat'} style={{backgroundColor: 'white', height: '100%'}}>
    <FlatList data={products} renderItem={({item}) => <ProductDisplayCardCustomerFeed product={item}/> }/>
    </Surface>
}