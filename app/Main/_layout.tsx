import {Tabs} from "expo-router";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {TouchableOpacity} from "react-native";
import {Colors} from '@/styles/Colors';

export default function TabsComponent() {
  return <Tabs screenOptions={{
      headerShown: false, tabBarShowLabel: false, animation: 'fade',
      tabBarStyle: {backgroundColor: 'white', paddingBottom: 0, paddingTop: 3},
      tabBarActiveTintColor: Colors.shamrockGreen,
      tabBarInactiveTintColor: 'black',
      tabBarButton: (props) => {return (<TouchableOpacity activeOpacity={1} {...props} />)} }}>
    <Tabs.Screen
        name="Feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <MaterialIcons name={'feed'} size={30} color={color}/>,
        }}
    />
    <Tabs.Screen
        name="Search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <MaterialIcons name={'search'} size={30} color={color}/>,
        }}
    />
      <Tabs.Screen
          name="AddNewProduct"
          options={{
              title: 'Add New Product',
              tabBarIcon: ({ color }) => <MaterialIcons name={'add-circle'} size={30} color={color}/>,
          }}
      />
      <Tabs.Screen
          name="ShoppingCart"
          options={{
              title: 'Shopping Cart',
              tabBarIcon: ({ color }) => <MaterialIcons name={'shopping-cart'} size={30} color={color}/>,
          }}
      />
      <Tabs.Screen
          name="StoreFront"
          options={{
              title: 'Store Front',
              tabBarIcon: ({ color }) => <MaterialIcons name={'storefront'} size={30} color={color}/>,
          }}
      />
  </Tabs>
}
