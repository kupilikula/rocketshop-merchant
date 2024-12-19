import {Tabs, useRouter} from "expo-router";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {TouchableOpacity, View, Text} from "react-native";
import {Colors} from '@/styles/Colors';
import AppHeader from '../../../components/AppHeader';
import {useTheme} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";
export default function TabsComponent() {

    const theme = useTheme();

  return <Tabs backBehavior={'history'} initialRouteName={'Dashboard'}
               screenOptions={{
      header: () => null, tabBarShowLabel: false, animation: 'fade',
      tabBarStyle: {backgroundColor: 'white', paddingBottom: 0, paddingTop: 3, },
      tabBarActiveTintColor: theme.colors.secondary,
      tabBarInactiveTintColor: 'black',
      tabBarButton: (props) => {return (<TouchableOpacity activeOpacity={1} {...props} />)} }}>
    <Tabs.Screen
        name="Dashboard"
        options={{
            // header: () => <FeedHeader />,
            headerShadowVisible: true,
            title:'',
          tabBarIcon: ({ color }) => <MaterialIcons name={'dashboard'} size={30} color={color}/>,
            headerShown: true,
        }}
    />
    <Tabs.Screen
        name="Products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <MaterialIcons name={'shopping-bag'} size={30} color={color}/>,
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
          name="Orders"
          options={{
              title: 'Orders',
              tabBarIcon: ({ color }) => <MaterialIcons name={'receipt-long'} size={30} color={color}/>,
          }}
      />
      <Tabs.Screen
          name="Store"
          options={{
              title: 'Store',
              tabBarIcon: ({ color }) => <MaterialIcons name={'storefront'} size={30} color={color}/>,
          }}
      />
      {/*<Tabs.Screen*/}
      {/*    name="EditProduct"*/}
      {/*    component={EditProduct}*/}
      {/*    options={{*/}
      {/*        tabBarButton: () => null, // Hides the tab bar button*/}
      {/*        tabBarStyle: { display: "none" }, // Hides the tab bar itself for this route*/}
      {/*    }}*/}
      {/*/>*/}
  </Tabs>
}
