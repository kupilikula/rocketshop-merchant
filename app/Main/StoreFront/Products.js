import {ScrollView} from "react-native";
import {Surface} from 'react-native-paper';
import ProductDisplayCardCustomerStore from "../../../components/ProductDisplayCardCustomerStore";

const productForCustomerStore = {
    storeName: 'Store Name',
    storeId: 'UUID',
    storeLogoImage: 'https://picsum.photos/600',
    productName: 'Product Name ABCD QWERT adsfsdf wefwef sdfsdf ewqdqwe wefdwef',
    productId: 'UUID',
    price: 375,
    rating: 3.5,
    mediaItems: [
        {
            mediaType: 'image',
            uri:
                'https://picsum.photos/700',
            orientation: 'landscape',
            desc:
                'Sample Description below the image for representation purpose only',
        },
        {
            mediaType: 'image',
            uri:
                'https://picsum.photos/500',
            orientation: 'landscape',
            desc:
                'Sample Description below the image for representation purpose only',
        },
        {
            mediaType: 'video',
            uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail: 'https://picsum.photos/400',
            orientation: 'landscape',
            desc: 'Test Video'
        }
    ]
}
export default function Products () {
    return <ScrollView>
    <Surface mode={'flat'} style={{backgroundColor: 'white', height: '100%'}}>
        <ProductDisplayCardCustomerStore product={productForCustomerStore}/>
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
        {/*<ProductDisplayCardCustomerFeed/>*/}
    </Surface>
    </ScrollView>
}