import { View } from "react-native";
import { Image } from "expo-image";
import {Card, Chip, Text, useTheme} from "react-native-paper";

export const ProductDisplayCompactMerchant = (props) => {
  // const router = useRouter();
    const theme = useTheme();
  const nAttributes = props.product.attributes.length;
  let nAttrOdd = nAttributes % 2 === 1;
  let nAttrRows = nAttrOdd ? (nAttributes + 1) / 2 : nAttributes / 2;

  return (
    <Card
      mode={props.cardMode || "elevated"}
      style={{ borderRadius: 0, height: 100, backgroundColor: "white" }}
    >
      <View
        style={{
          backgroundColor: "white",
          width: "100%",
          borderRadius: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Image
          source={props.product.mediaItems[0].uri}
          style={{
            width: 100,
            height: 100,
            borderRadius: 0,
          }}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            height: "100%",
            width: "100%",
            marginLeft: 5,
          }}
        >
          <Text variant={"titleMedium"}>{props.product.productName}</Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            <Text variant={"bodyLarge"} style={{ marginRight: 10 }}>
              {"Price: ₹" + props.product.price}
            </Text>
            <Text variant={"bodyLarge"}>{"Stock: " + props.product.stock}</Text>
          </View>
          <View style={{ width: "100%", maxWidth: "100%" }}>
            {[...Array(nAttrRows).keys()].map((r) => {
              let a1 = props.product.attributes[r * 2];
              let a2 =
                r === nAttrRows && nAttrOdd
                  ? null
                  : props.product.attributes[r * 2 + 1];
              return (
                <View
                  key={r.toString()}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text variant={"bodyLarge"} style={{ marginRight: 10 }}>
                    {a1.key}: {a1.value}
                  </Text>
                  {a2 && (
                    <Text variant={"bodyLarge"}>
                      {a2.key}: {a2.value}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
        <Chip
            mode="flat"
            style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: props.product.isActive ? theme.colors.softSuccess : theme.colors.inactive,
            }}
            textStyle={{
                color: 'black',
                fontSize: 12
            }}
        >
            {props.product.isActive ? 'Active' : 'Inactive'}
        </Chip>

    </Card>
  );
};
