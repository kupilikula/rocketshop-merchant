import { DrawerContentScrollView } from "@react-navigation/drawer";
import {Badge, Drawer, Text, useTheme} from "react-native-paper";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View, StyleSheet } from "react-native";
import { StoreLogo } from "@/components/StoreLogo";
import { faker } from "@faker-js/faker";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../store/actions/logout";
import MaterialCommunityIcon from "react-native-paper/src/components/MaterialCommunityIcon";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import DrawerItemsContent from "./DrawerItemsContent";

export default function DrawerMenu(props) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, height: "100%"}}
    >
      <DrawerItemsContent/>
    </DrawerContentScrollView>
  );
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