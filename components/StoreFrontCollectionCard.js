import { Card, Text } from "react-native-paper";
import { View } from "react-native";
import StoreFrontProductCard from "./StoreFrontProductCard";
import { Link } from "expo-router";

export default function StoreFrontCollectionCard(props) {
  return (
    <Card
      style={{
        width: "100%",
        height: "auto",
        padding: 10,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        marginTop: 10,
      }}
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
            {props.collection.products.length.toString() + " Products"}
          </Text>
        </View>
        <View>
          <Link
            href={
              "/Main/(tabs)/Collections/Collection/" +
              props.collection.collectionId
            }
          >
            <Text variant={"bodyLarge"}>See All</Text>
          </Link>
        </View>
      </View>
      <View
        style={{
          alignSelf: "center",
          flexDirection: "row",
          flexWrap: "wrap",
          display: "flex",
          width: "100%",
          justifyContent: "center",
        }}
      >
        {props.collection.products
          .slice(0, props.collection.storeFrontDisplayNumberOfItems)
          .map((p) => {
            return <StoreFrontProductCard product={p} key={p.productId} />;
          })}
      </View>
    </Card>
  );
}
