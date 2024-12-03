import {Tabs} from "expo-router";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {TouchableOpacity, View, Text} from "react-native";
import {Colors} from '@/styles/Colors';
import FeedHeader from '../../components/FeedHeader';
export default function TabsComponent() {

  return <Tabs backBehavior={'history'} initialRouteName={'Feed'} screenOptions={{
      header: () => null, tabBarShowLabel: false, animation: 'fade',
      tabBarStyle: {backgroundColor: 'white', paddingBottom: 0, paddingTop: 3},
      tabBarActiveTintColor: Colors.shamrockGreen,
      tabBarInactiveTintColor: 'black',
      tabBarButton: (props) => {return (<TouchableOpacity activeOpacity={1} {...props} />)} }}>
    <Tabs.Screen
        name="Feed"
        options={{
            header: () => <FeedHeader />,
            headerShadowVisible: true,
            title:'',
          tabBarIcon: ({ color }) => <MaterialIcons name={'feed'} size={30} color={color}/>,
            headerShown: true,
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
