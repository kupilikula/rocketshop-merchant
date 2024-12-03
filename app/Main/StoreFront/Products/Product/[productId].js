import {View, StyleSheet} from "react-native";
import {Card, Text} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FlatListSlider from "../../../../../components/MediaSlider/FlatListSlider";
import MediaItem from "../../../../../components/MediaSlider/MediaItem";
import { Rating } from '@kolking/react-native-rating';
import {useLocalSearchParams} from "expo-router";
import ProductDisplayCardCustomerStore from "../../../../../components/ProductDisplayCardCustomerStore";
import {getProductForStore} from "../../../../../utils/fakeDataMethods";
// import {useQuery} from "react-query";



export default function ProductPage (props) {

    const { productId} = useLocalSearchParams();

    // const productQuery = useQuery({ queryKey: ['getProduct', productId], queryFn: () => getProduct(productId) })
    // console.log('size:', size);
    return <ProductDisplayCardCustomerStore product={getProductForStore()} showProductDescription={true}/>
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 0,
        marginBottom: 10,
        backgroundColor: 'white'
    },
    titleTextStyle: {
        color: 'black',
        paddingLeft:0,
        marginLeft: 0,
        marginTop: 10
    },
    cardContent: {
        backgroundColor: 'white'
    },
    cardContentView: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    rating: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    ratingText: {
        marginLeft: 10
    },
    actionButtonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center'
    },
    actionButton: {
        margin: 10
    }
})