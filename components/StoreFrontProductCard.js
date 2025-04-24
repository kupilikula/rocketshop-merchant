import { Image } from "expo-image";
import { Card, Text } from "react-native-paper";
import { Rating } from "@kolking/react-native-rating";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {usePushWithBackHref} from "../utils/usePushWithBackHref";

export default function StoreFrontProductCard(props) {
  const pushWithBackHref = usePushWithBackHref();

  return (
    <Pressable
      onPress={() =>
        pushWithBackHref(`/Main/(tabs)/Products/${props.product.productId}`)
      }
    >
      <Card
        elevation={1}
        style={{
          margin: 10,
          width: 150,
          height: 250,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 0,
          backgroundColor: "white",
        }}
      >
        <Image
          source={props.product.mediaItems[0].uri}
          style={{ width: 150, height: 150, alignSelf: "center" }}
        />
        <View style={{ padding: 10 }}>
          <Text variant={"titleSmall"}>{props.product.productName}</Text>
          <Text variant={"bodyLarge"}>
            {"₹" + props.product.price.toString()}
          </Text>
          <View style={styles.rating}>
            <Rating
              disabled={true}
              variant={"stars-outline"}
              fillColor={"#faaf00"}
              baseColor={"black"}
              size={12}
              rating={props.product.rating}
              onChange={() => {}}
            />
            <Text style={styles.ratingText} variant={"bodyMedium"}>
              {"(" + props.product.numberOfRatings + ")"}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rating: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  ratingText: {
    marginLeft: 10,
  },
});
