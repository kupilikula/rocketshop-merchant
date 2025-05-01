import {Tabs, usePathname, useRouter} from "expo-router";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Platform, TouchableOpacity} from "react-native";
import { useTheme } from "react-native-paper";
import {useSelector} from "react-redux";
import AppHeader from "../../../components/AppHeader";
import GenericHeader from "../../../components/GenericHeader";

export default function TabsComponent() {
  const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();

  return (
    <Tabs
      backBehavior={"history"}
      initialRouteName={"Dashboard"}
      screenOptions={{
        header: () => null,
          contentStyle: { backgroundColor: theme.colors.surface },
          sceneContainerStyle: { backgroundColor: theme.colors.surface },
          tabBarShowLabel: false,
        animation: "none",
          tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "white",
          paddingBottom: Platform.OS==='android' ? 70 : 0,
          paddingTop: 3,
        },
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: "black",
        tabBarButton: (props) => {
          return <TouchableOpacity activeOpacity={1} {...props} />;
        },
      }}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          // header: () => <FeedHeader />,
          headerShadowVisible: true,
          title: "",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name={"dashboard"} size={30} color={color} />
          ),
          header: () => <AppHeader/>,
        }}
      />
      <Tabs.Screen
        name="Products"
        options={{
          title: "Products",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name={"shopping-bag"} size={30} color={color} />
          ),
        }}
        listeners={({ navigation, route }) => ({
            tabPress: (e) => {
                const isFocused = navigation.isFocused();
                if (isFocused) {
                    e.preventDefault();
                    if (pathname !== "/Main/Products") {
                        router.replace(`/Main/(tabs)/Products`);
                    }
                }
            },
        })}
      />
      <Tabs.Screen
        name="AddNewProduct"
        options={{
          title: "Add New Product",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name={"add-circle"} size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name={"receipt-long"} size={30} color={color} />
          ),
        }}
        listeners={({ navigation, route }) => ({
            tabPress: (e) => {
                const isFocused = navigation.isFocused();
                if (isFocused) {
                    e.preventDefault();
                    if (pathname !== "/Main/Orders") {
                        router.replace(`/Main/(tabs)/Orders`);
                    }
                }
            },
        })}

      />
      <Tabs.Screen
        name="Store"
        options={{
          title: "Store",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name={"store"} size={30} color={color} />
          ),
            header: () => null,
        }}
        listeners={({ navigation, route }) => ({
            tabPress: (e) => {
                const isFocused = navigation.isFocused();
                console.log('isF:', isFocused);
                if (isFocused) {
                    e.preventDefault();
                    console.log('route.name:', route.name);
                    if (pathname !== `/Main/(tabs)/Store`) {
                        router.replace(`/Main/(tabs)/Store`);
                    }

                }
            },
        })}

      />
      <Tabs.Screen
        name="Collections"
        options={{
          href: null,
          // tabBarButton: () => null, // Hides the tab bar button
        }}
      />
      <Tabs.Screen
        name="Customers"
        options={{
          href: null,
          // tabBarButton: () => null, // Hides the tab bar button
        }}
      />
      <Tabs.Screen
        name="Offers"
        options={{
          href: null,
          // tabBarButton: () => null, // Hides the tab bar button
        }}
      />
        <Tabs.Screen
            name="Messaging"
            options={{
                href: null,
                // tabBarButton: () => null, // Hides the tab bar button
            }}
        />
        <Tabs.Screen
            name="StoreSettings"
            options={{
                href: null,
                // tabBarButton: () => null, // Hides the tab bar button
            }}
        />
        <Tabs.Screen
            name="MerchantSettings"
            options={{
                href: null,
                // tabBarButton: () => null, // Hides the tab bar button
                header: () => null
            }}
        />
        <Tabs.Screen
            name="EditProduct"
            options={{
                href: null,
                // tabBarButton: () => null, // Hides the tab bar button
            }}
        />
    </Tabs>
  );
}
