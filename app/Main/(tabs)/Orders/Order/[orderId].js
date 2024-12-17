import {StyleSheet, View} from "react-native";
import {Text} from 'react-native-paper';
import {useLocalSearchParams} from "expo-router";
import ProductDisplayCardCustomerStore from "../../../../../components/ProductDisplayCardCustomerStore";
import {getProductForStore} from "../../../../../utils/fakeDataMethods";



export default function OrderPage (props) {

    const { orderId} = useLocalSearchParams();
    console.log('orderId:', orderId);
    // const productQuery = useQuery({ queryKey: ['getProduct', productId], queryFn: () => getProduct(productId) })
    // console.log('size:', size);
    return <View>
        <Text>Order: {orderId}</Text>
    </View>
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