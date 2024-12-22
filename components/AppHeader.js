import { View, Text, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import LogoIconWithName from "./LogoIconWithName";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateBoxShadowStyle } from "../styles/generateShadow";

export default function AppHeader(props) {
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        generateBoxShadowStyle(0, 4, "#171717", 0.2, 3, 4, "#171717"),
        {
          height: 60 + insets.top,
          paddingTop: insets.top,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
      ]}
    >
      <LogoIconWithName />
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      >
        <View
          style={{
            width: 40,
            height: 40,
            margin: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialIcons
            name={"menu"}
            size={28}
            style={{ color: theme.colors.secondary }}
          />
        </View>
      </Pressable>
    </View>
  );
}
