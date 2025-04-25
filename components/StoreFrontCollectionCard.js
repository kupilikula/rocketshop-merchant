import {Card, Text} from "react-native-paper";
import {Pressable, View} from "react-native";
import StoreFrontProductCard from "./StoreFrontProductCard";
import {Link, usePathname, useRouter} from "expo-router";
import {useApplicableOffers} from "../api/hooks/useApplicableOffers";
import OfferBar from "./OfferBar";

export default function StoreFrontCollectionCard(props) {
    // console.log('c:',props.collection);
    const router = useRouter();
    const currentPath = usePathname();

    const { data: offersData, } = useApplicableOffers({storeId: props.storeId, collectionId: props.collection?.collectionId});
    return (<Card
            style={{
                width: "100%",
                height: "auto",
                padding: 10,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
                borderRadius: 0, // marginTop: 10,
            }}
            mode={'contained'}
        >
        {!props.fallback &&
            <View
                style={{
                    display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%",
                }}
            >
                <View>
                    <Text variant={"titleLarge"}>{props.collection.collectionName}</Text>
                    <Text variant={"bodyLarge"}>
                        {props.collection.totalNumberOfProducts.toString() + " Products"}
                    </Text>
                </View>
                <View>
                    <Pressable onPress={() => {
                        router.push({
                            pathname: `/Main/(tabs)/Collections/${props.collection.collectionId}`, params: {
                                backHref: currentPath, // Pass the path of the current screen (StoreFront)
                                // Add any other params needed by the destination screen
                            }
                        });
                    }}>
                        <Text variant={"bodyLarge"}>See All</Text>
                    </Pressable>
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
                    <Link href={`/Main/(tabs)/Collections/Other`}><Text variant={'bodyLarge'}>See All</Text></Link>
                </View>
            </View>
        }
        {!props.fallback && offersData?.offers.length > 0 &&
            offersData.offers.map( (o) => !o.applicableTo.storeWide && !o.requireCode ? <OfferBar key = {o.offerId} offer={o} showCheckmark={false} fullWidth={false}/> : null)
        }
        {!props.fallback &&
            <View
                style={{
                    alignSelf: "center",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-around",
                }}
            >
                {props.collection.displayProducts
                    .map((p) => {
                        return <StoreFrontProductCard product={p} key={p.productId}/>;
                    })}
            </View>
        }
        {props.fallback && props.products?.length > 0 &&
            <View style={{alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', display: 'flex', width: '100%', justifyContent: 'space-around'}}>
                {props.products.slice(0,Math.min(8, props.products.length)).map( (p) => {
                    return <StoreFrontProductCard storeId={props.storeId} product={p} key={p.productId}/>})}
            </View>}
        </Card>);
}
