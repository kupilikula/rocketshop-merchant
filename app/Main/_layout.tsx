// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import {NavigationContainer} from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import Index from './Index';
// import Index from './Index';
// import {View, Text} from "react-native";
import {Stack, Tabs} from "expo-router";
// import {IconSymbol} from "@/app-example/components/ui/IconSymbol";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {TouchableOpacity} from "react-native";

// const Tabs = createBottomTabNavigator();

export default function TabsComponent() {
  return <Tabs screenOptions={{
      headerShown: false, tabBarShowLabel: false, animation: 'fade',
      tabBarActiveTintColor: 'green',
      tabBarInactiveTintColor: 'black',
      tabBarButton: (props) => {return (<TouchableOpacity activeOpacity={1} {...props} />)} }}>
    <Tabs.Screen
        name="Feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <MaterialIcons name={'feed'} size={28} color={color}/>,
        }}
    />
    <Tabs.Screen
        name="Search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <MaterialIcons name={'search'} size={28} color={color}/>,
        }}
    />
      <Tabs.Screen
          name="AddNewProduct"
          options={{
              title: 'Add New Product',
              tabBarIcon: ({ color }) => <MaterialIcons name={'add-circle'} size={28} color={color}/>,
          }}
      />
      <Tabs.Screen
          name="ShoppingCart"
          options={{
              title: 'Shopping Cart',
              tabBarIcon: ({ color }) => <MaterialIcons name={'shopping-cart'} size={28} color={color}/>,
          }}
      />
      <Tabs.Screen
          name="StoreFront"
          options={{
              title: 'Store Front',
              tabBarIcon: ({ color }) => <MaterialIcons name={'storefront'} size={28} color={color}/>,
          }}
      />
  </Tabs>
}
