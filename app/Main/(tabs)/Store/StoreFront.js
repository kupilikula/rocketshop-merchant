import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { Button, Card, Surface, Text } from "react-native-paper";
import { foregroundColor } from "../../../../utils/foregroundColor";
import { useQueries } from "react-query";
import { useStoreFrontData } from "../../../../utils/useStoreFrontData";
import { useStoreProducts } from "../../../../utils/useStoreProducts";
import ProductSearch from "../../../../components/ProductSearch";
import StoreFrontCollectionCard from "../../../../components/StoreFrontCollectionCard";
import { useLocalSearchParams } from "expo-router";

const getUniqueProducts = (products) => {
    return [...new Set(products)];
};

export default function StoreFront(props) {
    const { storeId } = useLocalSearchParams(); // Get storeId from route params

    const [storeFrontQuery, storeProductsQuery] = useQueries([
        {
            queryKey: ["storeFrontData", storeId],
            queryFn: () => useStoreFrontData(storeId).queryFn(),
            enabled: !!storeId,
            staleTime: 5 * 60 * 1000,
        },
        {
            queryKey: ["storeProducts", storeId],
            queryFn: () => useStoreProducts(storeId).queryFn(),
            enabled: !!storeId,
            staleTime: 5 * 60 * 1000,
        },
    ]);

    const storeFrontData = storeFrontQuery.data;
    const storeProductsData = storeProductsQuery.data;

    const [uniqueProducts, setUniqueProducts] = useState([]);
    const [textColor, setTextColor] = useState(null);

    // Extract unique products and set text color when data is fetched
    useEffect(() => {
        if (storeProductsData) {
            const uniqueProducts = getUniqueProducts(storeProductsData);
            setUniqueProducts(uniqueProducts);
        }
        if (storeFrontData) {
            const { textColor: t } = foregroundColor(storeFrontData.storeBrandColor);
            setTextColor(t);
        }
    }, [storeFrontData, storeProductsData]);

    const onFollowButtonPress = () => {
        // Example follow button logic
    };

    if (storeFrontQuery.isLoading || storeProductsQuery.isLoading) {
        return (
            <Surface
                mode={"flat"}
                style={{
                    backgroundColor: "white",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text>Loading...</Text>
            </Surface>
        );
    }

    if (storeFrontQuery.isError || storeProductsQuery.isError) {
        return (
            <Surface
                mode={"flat"}
                style={{
                    backgroundColor: "white",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text>Error loading store data.</Text>
            </Surface>
        );
    }

    return (
        storeFrontData &&
        storeProductsData && (
            <Surface
                mode={"flat"}
                style={{
                    backgroundColor: "white",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <ScrollView>
                    <View
                        style={{
                            padding: 10,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Card
                            style={{
                                width: "100%",
                                height: "auto",
                                padding: 10,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                backgroundColor: storeFrontData.storeBrandColor,
                            }}
                        >
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    width: "100%",
                                    height: "auto",
                                }}
                            >
                                <Image
                                    source={storeFrontData.storeLogoImage}
                                    style={{
                                        height: 80,
                                        width: 80,
                                        borderRadius: 40,
                                        borderStyle: "solid",
                                        borderWidth: 2,
                                        borderColor: textColor,
                                        margin: 0,
                                        padding: 0,
                                    }}
                                />
                                <View>
                                    <Text
                                        variant={"displaySmall"}
                                        style={{ marginTop: 10, color: textColor }}
                                    >
                                        {storeFrontData.storeName}
                                    </Text>
                                </View>
                                <View>
                                    <Text variant={"titleMedium"} style={{ color: textColor }}>
                                        {storeProductsData.length.toString() +
                                            " Products " +
                                            storeFrontData.collections.length +
                                            " Collections"}
                                    </Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Button
                                        mode={"elevated"}
                                        elevation={5}
                                        buttonColor={"white"}
                                        textColor={"black"}
                                        style={{ borderRadius: 5 }}
                                        labelStyle={{ fontSize: 18 }}
                                        onPress={onFollowButtonPress}
                                    >
                                        Follow
                                    </Button>
                                </View>
                            </View>
                        </Card>
                        <ProductSearch
                            uniqueProducts={uniqueProducts}
                            limitedResults={true}
                            resultsLimit={9}
                            initialSearchQuery={""}
                            style={{ marginTop: 10 }}
                        />
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            {storeFrontData.collections.map((c) => (
                                <StoreFrontCollectionCard collection={c} key={c.collectionId} />
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </Surface>
        )
    );
}