import {Card, Text} from "react-native-paper";
import {Platform, View} from "react-native";
import StoreFrontProductCard from "./StoreFrontProductCard";
import {Link} from "expo-router";
import {useApplicableOffers} from "../api/hooks/useApplicableOffers";
import OfferBar from "./OfferBar";
import {getCollectionPath, getOtherCollectionPath} from "../utils/getPathUtils";
import {useMemo} from "react";


const IS_WEB = Platform.OS === 'web';
export default function StoreFrontCollectionCard(props) {

    const { data: offersData, } = useApplicableOffers({storeId: props.storeId, collectionId: props.collection?.collectionId});
    // Determine the actual products to display based on fallback or collection
    const productsToDisplay = useMemo(() => {
        if (props.fallback) {
            return props.products?.slice(0, Math.min(8, props.products?.length || 0)) || [];
        }
        return props.collection?.displayProducts?.slice(0, props.collection?.storeFrontDisplayNumberOfItems || 0) || [];
    }, [props.fallback, props.products, props.collection]);

    return <Card style={{
        width: '100%',
        height: 'auto',
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        alignSelf: 'stretch',
        borderRadius: 0,
    }}
                 mode={'contained'}
    >

        {!props.fallback && props.collection &&
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                <View>
                    <Text variant={'titleLarge'}>{props.collection.collectionName}</Text>
                    <Text variant={'bodyLarge'}>{props.collection.totalNumberOfProducts.toString() + ' Products'}</Text>
                </View>
                <View>
                    <Link href={getCollectionPath(props.storeId, props.collection.collectionId)}><Text variant={'bodyLarge'}>See All</Text></Link>
                </View>
            </View>
        }
        {props.fallback &&
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                <View>
                    {props.showFallbackName && <Text variant={'titleLarge'}>Other</Text>}
                    <Text variant={'bodyLarge'}>{props.products?.length.toString() + ' Products'}</Text>
                </View>
                <View>
                    <Link href={getOtherCollectionPath(props.storeId)}><Text variant={'bodyLarge'}>See All</Text></Link>
                </View>
            </View>
        }

        {!props.fallback && offersData?.offers.length > 0 &&
            offersData.offers.map( (o) => !o.applicableTo.storeWide && !o.requireCode ? <OfferBar key = {o.offerId} offer={o} showCheckmark={false} fullWidth={false}/> : null)
        }

        {productsToDisplay.length > 0 && (
            <View style={{backgroundColor: 'white', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', display: 'flex', width: '100%', justifyContent: IS_WEB ? 'center' : 'space-around'}}>
                {productsToDisplay.map( (p) => {return <StoreFrontProductCard storeId={props.storeId} product={p} key={p.productId}/>})}
            </View>
        )}
    </Card>
}
