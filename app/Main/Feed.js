import {ScrollView} from "react-native";
import {Surface} from "react-native-paper";
import ProductDisplayCardCustomerFeed from "../../components/ProductDisplayCardCustomerFeed";

export default function Feed () {
    return <ScrollView>
        <Surface mode={'flat'} style={{backgroundColor: 'white', height: '100%'}}>
            <ProductDisplayCardCustomerFeed/>
            <ProductDisplayCardCustomerFeed/>
            <ProductDisplayCardCustomerFeed/>
            <ProductDisplayCardCustomerFeed/>
            <ProductDisplayCardCustomerFeed/>
            <ProductDisplayCardCustomerFeed/>
        </Surface>
    </ScrollView>
}