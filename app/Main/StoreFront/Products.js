import {View, Text, ScrollView} from "react-native";
import ProductDisplayCardCustomerFeed from "../../../components/ProductDisplayCardCustomerFeed";
import {Surface} from 'react-native-paper';

export default function Products () {
    return <ScrollView>
    <Surface mode={'flat'} style={{backgroundColor: 'white', height: '100%'}}>
        <ProductDisplayCardCustomerFeed/>
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
    </Surface>
    </ScrollView>
}