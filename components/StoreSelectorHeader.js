import {View, Pressable, StyleSheet} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import LogoIconWithName from "./LogoIconWithName";

import {useRouter} from "expo-router";
import {IconButton, useTheme} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { generateBoxShadowStyle } from "../styles/generateShadow";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../store/actions/logout";

export default function StoreSelectorHeader(props) {
    const theme = useTheme();
  const styles = makeStyles(theme);
  const dispatch = useDispatch();
  const router = useRouter();
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
        <IconButton icon="logout" size={24} onPress={() => logout(dispatch, router)}/>
    </View>);

}

const makeStyles  = (theme) => StyleSheet.create({
    iconContainer: {
        position: 'relative',
        // width: 40, // Ensures enough space for the icon and badge
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: 'red',
        color: 'white',
        fontSize: 10,
        height: 18,
        minWidth: 18,
        borderRadius: 9,
        textAlign: 'center',
        lineHeight: 18,
        overflow: 'hidden',
    },
})