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

export default function DrawerMenu(props) {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useDispatch();
  const styles = makeStyles(theme);
  const {storeLogoImage} = useSelector(state => state.store);
  const stores = useSelector(state => state.allStores.stores);
  const unreadCount = useSelector(
      (state) =>
          Object.values(state.badges.unreadMessages || {}).flat().length // Total unread messages
  );
  // console.log('props:', JSON.stringify(props));
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, height: "100%" }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <StoreLogo logoImage={storeLogoImage} size={40} />
        <Text variant={"displaySmall"} style={{ marginLeft: 15 }}>
          Store Name
        </Text>
      </View>
      <Drawer.Item
        label={<Text variant={"titleLarge"}>Store Front</Text>}
        style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
        onPress={() => {
          router.push("/Main/(tabs)/Store/StoreFront");
        }}
        icon={({ size, color }) => <MaterialIcons name={"store"} size={size} />}
      />
      <Drawer.Item
        label={<Text variant={"titleLarge"}>Products</Text>}
        style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
        onPress={() => router.push("/Main/(tabs)/Products")}
        icon={({ size, color }) => (
          <MaterialIcons name={"shopping-bag"} size={size} />
        )}
      />
      <Drawer.Item
        label={<Text variant={"titleLarge"}>Collections</Text>}
        style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
        onPress={() => {
          router.push("/Main/(tabs)/Collections");
        }}
        icon={({ size, color }) => (
          <MaterialIcons name={"category"} size={size} />
        )}
      />
      <Drawer.Item
        label={<Text variant={"titleLarge"}>Orders</Text>}
        style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
        onPress={() => router.push("/Main/(tabs)/Orders")}
        icon={({ size, color }) => (
          <MaterialIcons name={"receipt-long"} size={size} />
        )}
      />
      <Drawer.Item
        label={<Text variant={"titleLarge"}>Customers</Text>}
        style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
        onPress={() => router.push("/Main/(tabs)/Customers")}
        icon={({ size, color }) => <MaterialIcons name={"hail"} size={size} />}
      />
      <Drawer.Item
        label={<Text variant={"titleLarge"}>Offers</Text>}
        style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
        onPress={() => router.push("/Main/(tabs)/Offers")}
        icon={({ size, color }) => (
          <MaterialIcons name={"discount"} size={size} />
        )}
      />
      <Drawer.Item
          label={<Text variant={"titleLarge"}>Shipping</Text>}
          style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
          onPress={() => router.push("/Main/(tabs)/Shipping")}
          icon={({ size, color }) => (
              <MaterialIcons name={"local-shipping"} size={size} />
          )}
      />
      <Drawer.Item label={<Text variant={'titleLarge'}>Messages</Text>}
                   style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                   onPress={() => {router.push('/Main/(tabs)/Messaging')}}
                   icon={({ size, color }) => (
                       <View style={styles.iconContainer}>
                         <MaterialIcons name="chat" size={size} color={color} />
                         {unreadCount > 0 && (
                             <Badge style={styles.badge}>{unreadCount}</Badge>
                         )}
                       </View>
                   )}
      />
      <Drawer.Item
        label={<Text variant={"titleLarge"}>Settings</Text>}
        style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
        onPress={() => router.push("/Main/(tabs)/Settings")}
        icon={({ size, color }) => (
          <MaterialIcons name={"settings"} size={size} />
        )}
      />
      {stores.length > 1 &&
      <Drawer.Item label={<Text variant={'titleLarge'}>Change Store</Text>}
                   style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                   onPress={  () => router.push("/StoreSelector")}
                   icon={({size, color}) => <MaterialCommunityIcons name={'store-cog'} size={size}/>}/>}
      <Drawer.Item label={<Text variant={'titleLarge'}>Log out</Text>}
                   style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                   onPress={ async () => {
                     try {
                       await logout(dispatch, router); // Pass `dispatch` and `router` to logout
                     } catch (err) {
                       console.log('error during logout:', err);
                     }
                   }}
                   icon={({size, color}) => <MaterialIcons name={'logout'} size={size}/>}/>
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