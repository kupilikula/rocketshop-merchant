import {StyleSheet} from "react-native";
import {useLocalSearchParams} from "expo-router";
import ProductDisplayCardCustomerStore from "../../../../../components/ProductDisplayCardCustomerStore";
import {getProductForStore} from "../../../../../utils/fakeDataMethods";
import ProductScreenMerchant from "../../../../../components/ProductScreenMerchant";



export default function ProductPage (props) {

    const { productId} = useLocalSearchParams();

    return <ProductScreenMerchant product={getProductForStore()} showProductDescription={true}/>
}
