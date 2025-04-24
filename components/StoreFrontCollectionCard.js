import { Card, Text } from "react-native-paper";
import {Pressable, View} from "react-native";
import StoreFrontProductCard from "./StoreFrontProductCard";
import {Link, usePathname, useRouter} from "expo-router";

export default function StoreFrontCollectionCard(props) {
    // console.log('c:',props.collection);
    const router = useRouter();
    const currentPath = usePathname();


    return (
    <Card
      style={{
        width: "100%",
        height: "auto",
        padding: 10,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
          borderRadius: 0,
        // marginTop: 10,
      }}
      mode={'contained'}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
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
    router.replace({
        pathname: `/Main/(tabs)/Collections/Collection/${props.collection.collectionId}`,
        params: {
            backHref: currentPath, // Pass the path of the current screen (StoreFront)
            // Add any other params needed by the destination screen
        }
    });
}}>
            <Text variant={"bodyLarge"}>See All</Text>
</Pressable>
        </View>
      </View>
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
            return <StoreFrontProductCard product={p} key={p.productId} />;
          })}
      </View>
    </Card>
  );
}
