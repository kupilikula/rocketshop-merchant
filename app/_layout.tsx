import {Stack} from "expo-router";
import {PaperProvider} from "react-native-paper";
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import {View} from "react-native";
import {StatusBar} from "expo-status-bar";
import * as NavigationBar from 'expo-navigation-bar';
import {useEffect} from "react";

// const Tabs = createBottomTabNavigator();
const isLoggedIn = true;
export default function RootLayout() {

    const insets = useSafeAreaInsets();

    useEffect( () => {
        (async () => {
            await NavigationBar.setBackgroundColorAsync("white")
        })();
    },[])


    return ( <SafeAreaProvider>
      <PaperProvider>
          <StatusBar style="dark" backgroundColor={'white'} />
          {/*<NavigationBar backgroundColor={'white'}/>*/}
    <View style={{paddingTop: insets.top, width: '100%', height: '100%'}}>
      <Stack screenOptions={{headerShown: false}}/>
    </View>
  </PaperProvider>
  </SafeAreaProvider>);
}
