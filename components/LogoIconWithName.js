import { Text, useTheme } from "react-native-paper";
import { View } from "react-native";
import { Image } from "expo-image";
import { Platform } from "react-native";
import { Atma_600SemiBold } from "@expo-google-fonts/atma";
import { useFonts } from "expo-font";

export default function LogoIconWithName({style}) {
  const theme = useTheme();
  let [fontsLoaded] = useFonts({
    Atma_600SemiBold,
  });
  return (
    <View
      style={{
        height: 58,
        backgroundColor: "white",
        top: 0,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
          ...style
      }}
    >
      <Image
        source={require("../assets/images/RocketShopIconOrange1024.png")}
        style={{ width: 50, height: 50, margin: 5 }}
      />
        {fontsLoaded &&
      <Text
        style={{
          fontFamily: Platform.select({
            android: "Atma_600SemiBold",
            ios: "Atma-SemiBold",
              web: "Atma_600SemiBold",
          }),
          color: theme.colors.primary,
          fontSize: 26,
          lineHeight: 50,
        }}
      >
        RocketShop
      </Text>}
    </View>
  );
}
