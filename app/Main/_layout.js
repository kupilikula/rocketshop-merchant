import { Drawer } from "expo-router/drawer";
import DrawerMenu from "../../components/DrawerMenu";
import {useEffect, useState} from "react";
import {useTheme} from "react-native-paper";
import {Platform, Text, View} from "react-native";
import {Slot} from "expo-router";
import {RequireAuth} from "../../components/RequireAuth";

const IS_WEB = Platform.OS === "web";

export default function Layout() {

  const theme = useTheme();

  useEffect(() => {
      console.log('Mounting MAIN');
      return () => {
          console.log('Unmounting Main');
      }
  },[])

    // --- Platform-Specific UI Rendering ---
    if (Platform.OS === 'web') {
        // This layout (app/Main/_layout.js) should ideally not be reached by web routes
        // if web navigation is structured under (public_marketplace) and (authenticated_user).
        // This is a fallback/defensive measure.
        console.warn("Web platform accessed /Main/_layout.js. This is usually for mobile. Redirecting or showing error.");
        // Option 1: Redirect to the web's main entry point
        // return <Redirect href="/(public_marketplace)/" />; // Or simply "/"
        // Option 2: Show a message or a basic slot if some content under /Main needs to be web-accessible without the drawer
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text style={{textAlign: 'center'}}>This content is typically viewed within the mobile app's main navigation. You might be seeing a simplified version.</Text>
                <Slot />
            </View>
        );
    }

  return (<RequireAuth>
    <Drawer
      initialRouteName={"(tabs)"}
      backBehavior={"history"}
      screenOptions={({ route }) => ({
          contentStyle: {backgroundColor: theme.colors.surface},
        drawerPosition: "right",
        drawerType: "front",
        headerShadowVisible: true,
        headerTitle: "",
          contentContainerStyle: {flex: 1, height: "100%", backgroundColor: theme.colors.surface},
        drawerContentStyle: { flex: 1, height: "100%" },
        drawerContentContainerStyle: {
          flex: 1,
          height: "100%", // Ensure full height
        },
          sceneContainerStyle: {flex: 1, height: "100%", backgroundColor: theme.colors.surface},
        drawerStyle: {
          flex: 1,
          height: "100%",
          width: "80%",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        // header: () => {
        //   console.log("pathName:", pathName);
        //   return pathName.startsWith("/Main/AddNewProduct") ||
        //   pathName.startsWith("/Main/EditProduct") ||
        //     pathName.startsWith("/Main/Products") ||
        //     pathName.startsWith("/Main/Orders") ||
        //     pathName.startsWith("/Main/Collections") ||
        //     pathName.startsWith("/Main/Customers") ||
        //     pathName.startsWith("/Main/Messaging") ||
        //   pathName.startsWith("/Main/Shipping") ||
        //   pathName.startsWith("/Main/Offers") ||
        //   pathName.startsWith("/Main/StoreSettings") ||
        //     pathName.startsWith("/CreateStore")
        //       ? null : (
        //     <AppHeader />
        //   );
        // },
          header: () => null,
      })}
      drawerContent={(props) => <DrawerMenu {...props} />}
    ></Drawer>
      </RequireAuth>
  );
}
