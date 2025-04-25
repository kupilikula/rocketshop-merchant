import React, {useEffect, useMemo, useState} from "react";
import {Pressable, ScrollView, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import {Button, Card, Divider, Surface, Text, useTheme, ActivityIndicator} from "react-native-paper";
import { foregroundColor } from "../../../../utils/foregroundColor";
import { useQueries } from "react-query";
import { fetchStoreFrontData } from "../../../../api/hooks/useStoreFrontData"; // Extracted query function
import { fetchStoreProducts } from "../../../../api/hooks/useStoreProducts"; // Extracted query function
import ProductSearch from "../../../../components/ProductSearch";
import StoreFrontCollectionCard from "../../../../components/StoreFrontCollectionCard";
import {useLocalSearchParams, usePathname, useRouter} from "expo-router";
import {useSelector} from "react-redux";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Rating} from "@kolking/react-native-rating";
import KeyboardAwareScrollableScreen from "../../../../components/KeyboardAwareScrollableScreen";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {usePushWithBackHref} from "../../../../utils/usePushWithBackHref";
import {useApplicableOffers} from "../../../../api/hooks/useApplicableOffers";
import OfferBar from "../../../../components/OfferBar";

const getUniqueProducts = (products) => {
    return [...new Set(products)];
};

export default function StoreFront(props) {
    const { storeId } = useSelector((state) => state.store);
    const router = useRouter();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const merchant = useSelector((state) => state.merchant);
    const store = useSelector((state) => state.store);
    const insets = useSafeAreaInsets();
    const pushWithBackHref = usePushWithBackHref();
    console.log('store:', store);
    console.log('merchant:', merchant);

    // Parallel queries using useQueries
    const [storeFrontQuery, storeProductsQuery] = useQueries([
        {
            queryKey: ["storeFrontData", storeId],
            queryFn: () => fetchStoreFrontData(storeId),
            enabled: !!storeId,
            staleTime: 5 * 60 * 1000,
        },
        {
            queryKey: ["storeProducts", storeId],
            queryFn: () => fetchStoreProducts(storeId),
            enabled: !!storeId,
            staleTime: 5 * 60 * 1000,
        },
    ]);
    const { data: offersData, } = useApplicableOffers({storeId: storeId, storeWide: true});

    const storeFrontData = storeFrontQuery.data;
    const storeProductsData = storeProductsQuery.data;

    const currentPath = usePathname();

    // Extract unique products and set text color when data is fetched

    const uniqueProducts = useMemo(() => getUniqueProducts(storeProductsData || []), [storeProductsData]);

    const notInAnyActiveCollectionProducts = useMemo(() => storeProductsData?.filter(p => p.collections.filter(c => c.isActive).length===0), [storeProductsData]);

    if (storeFrontQuery.isLoading || storeProductsQuery.isLoading) {
        return (
            <View
                style={{
                    backgroundColor: theme.colors.surface,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator size={100} animating={true} color={theme.colors.primary}/>
            </View>
        );
    }

    if (storeFrontQuery.isError || storeProductsQuery.isError) {
        return (
            <View
                mode={"flat"}
                style={{
                    backgroundColor: theme.colors.surface,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text variant={"titleLarge"}>Error loading store data.</Text>
            </View>
        );
    }

    return (
        storeFrontData &&
        storeProductsData && (
            <KeyboardAwareScrollableScreen
                backgroundColor={theme.colors.surface}
                innerStyle={{
                    backgroundColor: theme.colors.surface,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    width: '100%'
                }}
                contentContainerStyle={{ width: '100%', padding: 0, alignSelf: 'stretch'}}
                keyboardVerticalOffset={insets.top + 60}
            >
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'stretch',
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Card
                            style={{
                                flex: 1,
                                height: "auto",
                                // paddingVertical: 16,
                                padding: 16,
                                backgroundColor: theme.colors.white,
                                borderRadius: 0
                            }}
                            mode={'contained'}
                        >
                            <View style={{
                                display: 'flex',
                                flexDirection: 'column',
                                // margin: 16,
                                width: '100%',
                                alignSelf: 'stretch',
                            }}>
                                <View
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: 'center',
                                        alignSelf: 'stretch',
                                        // width: "100%",
                                        height: "auto",
                                        // backgroundColor: 'green'
                                    }}
                                >
                                    <Image
                                        source={storeFrontData.storeLogoImage}
                                        style={{
                                            height: 80,
                                            width: 80,
                                            borderRadius: 40,
                                            borderStyle: "solid",
                                            borderWidth: 1,
                                            borderColor: 'black',
                                            margin: 0,
                                            padding: 0,
                                        }}
                                    />
                                    <View style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        marginLeft: 8,
                                        flex: 1
                                    }}>
                                        <Text
                                            // variant={"displaySmall"}
                                            style={{color: 'black', fontSize: 20}}
                                            // adjustsFontSizeToFit={true}
                                            numberOfLines={2}
                                        >
                                            {storeFrontData.storeName}
                                        </Text>
                                        <View>
                                            <Text variant={"titleMedium"} style={{color: 'black'}}>
                                                {storeProductsData.length.toString() + " Products " + storeFrontData.totalNumberOfCollections + " Collection" + (storeFrontData.totalNumberOfCollections > 1 ? 's' : '')}
                                            </Text>
                                        </View>
                                        <View>
                                            <Pressable onPress={() => router.push('./FollowersList')}>
                                                <Text variant={"titleMedium"} style={{ color: 'black' }}>
                                                    {storeFrontData.followerCount +
                                                        " Followers"}
                                                </Text>
                                            </Pressable>
                                        </View>
                                        <View style={styles.rating}>
                                            <Rating
                                                disabled={true}
                                                variant={"stars-outline"}
                                                fillColor={"#faaf00"}
                                                baseColor={"black"}
                                                size={18}
                                                rating={storeFrontData.rating || 0}
                                                onChange={() => {
                                                }}
                                            />
                                            <Text style={styles.ratingText} variant={"bodyLarge"}>
                                                {storeFrontData.rating.toString() + "/5 " + "(" + storeFrontData.numberOfRatings.toString() + ")"}
                                            </Text>
                                        </View>
                                    </View>

                                </View>
                                <View style={{ width:'100%', marginTop: 10}}>
                                    <Text variant={"bodyLarge"} style={{color: 'black'}}>
                                        {storeFrontData.storeDescription}
                                    </Text>
                                </View>
                                {store.merchantRole==='Admin' &&
                                <View style={{ marginTop: 10, alignSelf: 'center'}}>
                                    <Button
                                        mode={"elevated"}
                                        elevation={5}
                                        buttonColor={theme.colors.primary}
                                        textColor={"white"}
                                        style={{borderRadius: 8}}
                                        icon={({size, color}) => <MaterialIcons name={'settings'} size={size} color={'white'}/>}
                                        onPress={() => {
                                            router.push({
                                                pathname: `/Main/(tabs)/StoreSettings`,
                                                params: {
                                                    backHref: currentPath, // Pass the path of the current screen (StoreFront)
                                                    // Add any other params needed by the destination screen
                                                }
                                            })}}
                                    >
                                        Settings
                                    </Button>
                                </View>
                                }
                            </View>
                        </Card>
                        {offersData?.offers.length > 0 &&
                            <Card style={{padding: 8, backgroundColor: 'white', marginVertical: 0, borderRadius: 0}} mode={'contained'}>
                                <Text variant={'titleMedium'}>Store Wide Offers</Text>
                                {offersData.offers.map( (o) => !o.requireCode ? <OfferBar key = {o.offerId} offer={o} showCheckmark={false} fullWidth={true}/> : null)}
                            </Card>
                        }
                        <Divider style={{marginVertical: 2}}/>
                        <ProductSearch
                            uniqueProducts={uniqueProducts}
                            onSearchResultPressHandler={(product) =>
                                pushWithBackHref(`/Main/(tabs)/Products/${product.productId}`)}
                            limitedResults={true}
                            resultsLimit={5}
                            initialSearchQuery={""}
                            style={{ paddingHorizontal: 10, marginVertical: 10, alignSelf: 'stretch'}}
                        />
                        <Divider style={{marginVertical: 2}}/>
                        {storeFrontData?.displayCollections.length > 0 &&
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            {storeFrontData.displayCollections.map((c) => (
                                <View  key={c.collectionId}>
                                    <StoreFrontCollectionCard storeId={storeId} collection={c}/>
                                    <Divider style={{marginVertical: 10}}/>
                                </View>
                            ))}
                        </View>
                        }
                        {notInAnyActiveCollectionProducts.length > 0 &&
                            <StoreFrontCollectionCard storeId={storeId} fallback={true} products={notInAnyActiveCollectionProducts} showFallbackName={storeFrontData?.displayCollections?.length>0} collection={undefined}/>
                        }
                    </View>
            </KeyboardAwareScrollableScreen>
        )
    );
}

const makeStyles = (theme) => StyleSheet.create({

    followButton: {
        borderRadius: 5,
    },
    followingButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: theme.colors.white,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: theme.colors.secondary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 10
    },
    followButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: theme.colors.secondary,
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 10
    }, messageButtonContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-around",
        backgroundColor: theme.colors.secondary,
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 10
    }, followingText: {
        fontSize: 16, fontWeight: "600", color: "black",
    }, unfollowButton: {
        justifyContent: "center", alignItems: "center",
    }, buttonLabel: {
        fontSize: 18, fontWeight: "600",
    }, buttonContent: {
        flexDirection: "row", justifyContent: "center",
    }, rating: {
        display: "flex", flexDirection: "row", justifyContent: "flex-start", marginVertical: 0,
    }, ratingText: {
        marginLeft: 10,
    },
})