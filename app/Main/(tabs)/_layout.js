import { Tabs } from "expo-router";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Platform, TouchableOpacity} from "react-native";
import { useTheme } from "react-native-paper";

export default function TabsComponent() {
  const theme = useTheme();

  return (
    <Tabs
      backBehavior={"history"}
      initialRouteName={"Dashboard"}
      screenOptions={{
        header: () => null,
        tabBarShowLabel: false,
        animation: "fade",
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
          headerShown: true,
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
      />
      <Tabs.Screen
        name="Store"
        options={{
          title: "Store",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name={"storefront"} size={30} color={color} />
          ),
        }}
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
            name="Settings"
            options={{
                href: null,
                // tabBarButton: () => null, // Hides the tab bar button
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
