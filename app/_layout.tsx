// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import {NavigationContainer} from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import Index from './Index';
// import Index from './Index';
// import {View, Text} from "react-native";
import {Redirect, Stack} from "expo-router";
import TabsLayout from "@/app/Main/_layout";
import {PaperProvider} from "react-native-paper";

// const Tabs = createBottomTabNavigator();
const isLoggedIn = true;
export default function RootLayout() {
  return (<PaperProvider>
    <Stack screenOptions={{headerShown: false}}/>
  </PaperProvider>);
}
