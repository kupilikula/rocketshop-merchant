import {FlatList, ScrollView} from "react-native";
import {Surface} from "react-native-paper";
import ProductDisplayCardCustomerFeed from "../../components/ProductDisplayCardCustomerFeed";

const products = [
    <ProductDisplayCardCustomerFeed/>,
    <ProductDisplayCardCustomerFeed/>,
    <ProductDisplayCardCustomerFeed/>,
    <ProductDisplayCardCustomerFeed/>,
    <ProductDisplayCardCustomerFeed/>,
]

export default function Feed () {
    return <Surface mode={'flat'} style={{backgroundColor: 'white', height: '100%'}}>
    <FlatList data={products} renderItem={({item}) => item}/>
    </Surface>
}