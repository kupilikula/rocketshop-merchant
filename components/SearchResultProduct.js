import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import {Card, Text, useTheme} from "react-native-paper";
import { useRouter } from "expo-router";

export const SearchResultProduct = (props) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/Main/(tabs)/Products/Product/${props.product.productId}`,
        )
      }
    >
      <View
        style={{
          height: 60,
          borderStyle: "solid",
            borderWidth: 1,
            borderRadius: 8,
            borderColor: theme.colors.grayBorder,
          // borderBottomWidth: 1,
          // borderRightWidth: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
            overflow: 'hidden'
        }}
      >
        <Image
          source={props.product.mediaItems[0].uri}
          style={{ width: 60, height: 60 }}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            height: "100%",
            marginLeft: 5,
          }}
        >
          <Text variant={"titleMedium"}>{props.product.productName}</Text>
          <Text variant={"bodyLarge"}>{"₹" + props.product.price}</Text>
        </View>
      </View>
    </Pressable>
  );
};
