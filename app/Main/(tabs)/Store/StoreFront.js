import { ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { Button, Card, Surface, Text } from "react-native-paper";
import { foregroundColor } from "../../../../utils/foregroundColor";
import { useEffect, useState } from "react";
import StoreFrontCollectionCard from "../../../../components/StoreFrontCollectionCard";
import { getStoreFullData } from "../../../../utils/fakeDataMethods";
// import { useRouter } from "expo-router";
import ProductSearch from "../../../../components/ProductSearch";

const getUniqueProducts = (storeData) => {
  const allProducts = storeData.collections.reduce(
    (A, c) => A.concat(c.products),
    [],
  );
  return [...new Set(allProducts)];
};

export default function StoreFront(props) {
  // const results = useQuery({ queryKey: ['storeDataFull', storeId], queryFn: getStoreDataFull });
  const [storeFullData, setStoreFullData] = useState(null);
  const [uniqueProducts, setUniqueProducts] = useState([]);
  const [textColor, setTextColor] = useState(null);
  const [oppositeColor, setOppositeColor] = useState(null);
  const [followButtonText, setFollowButtonText] = useState("Follow");
  const [followButtonLoading, setFollowButtonLoading] = useState(false);

  // const router = useRouter();

  useEffect(() => {
    let d = getStoreFullData();
    setStoreFullData(d);
    setUniqueProducts(getUniqueProducts(d));
  }, []);

  useEffect(() => {
    if (storeFullData) {
      let { textColor: t, oppositeColor: o } = foregroundColor(
        storeFullData.storeBrandColor,
      );
      setTextColor(t);
      setOppositeColor(o);
    }
  }, [storeFullData]);

  const onFollowButtonPress = () => {
    if (followButtonText === "Follow") {
      setFollowButtonLoading(true);
      setTimeout(() => {
        setFollowButtonText("Following");
        setFollowButtonLoading(false);
      }, 1000);
    } else {
      setFollowButtonText("Follow");
    }
  };

  return (
    storeFullData && (
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
                backgroundColor: storeFullData.storeBrandColor,
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
                  source={storeFullData.storeLogoImage}
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
                    {storeFullData.storeName}
                  </Text>
                </View>
                <View>
                  <Text variant={"titleMedium"} style={{ color: textColor }}>
                    {uniqueProducts.length.toString() +
                      " Products " +
                      +storeFullData.collections.length +
                      " Collections"}
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Button
                    mode={"elevated"}
                    elevation={5}
                    loading={followButtonLoading}
                    buttonColor={"white"}
                    textColor={"black"}
                    style={{ borderRadius: 5 }}
                    labelStyle={{ fontSize: 18 }}
                    onPress={onFollowButtonPress}
                  >
                    {followButtonText}
                  </Button>
                </View>
              </View>
            </Card>
            <ProductSearch
              uniqueProducts={uniqueProducts}
              limitedResults={true}
              resultsLimit={5}
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
              {storeFullData.collections.map((c) => {
                return (
                  <StoreFrontCollectionCard
                    collection={c}
                    key={c.collectionId}
                  />
                );
              })}
            </View>
          </View>
          <View></View>
        </ScrollView>
      </Surface>
    )
  );
}
