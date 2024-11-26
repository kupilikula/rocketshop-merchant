import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import {useNavigation} from "expo-router";
import {Pressable, TouchableOpacity, View} from "react-native";
import {DrawerActions} from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {DrawerToggleButton} from "@react-navigation/drawer";


export default function Layout() {
    // const navigation = useNavigation();
    const navigation = useNavigation();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer screenOptions={{drawerPosition: 'right', headerLeft: () => false,
                headerRight: () => <DrawerToggleButton />,
                headerShadowVisible: false,
                headerTitle: '',
                drawerStyle: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0},
            }}
            // drawerContent={() =>
            //     (<Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}>
            //         <MaterialIcons name={'close'}/>
            //     </Pressable>)
            // }
            >
                <Drawer.Screen
                    name="Products" // This is the name of the page and must match the url from root
                    options={{
                        drawerLabel: 'Products',
                    }}
                />
                <Drawer.Screen
                    name="Collections" // This is the name of the page and must match the url from root
                    options={{
                        drawerLabel: 'Collections',
                    }}
                />
                <Drawer.Screen
                    name="Orders" // This is the name of the page and must match the url from root
                    options={{
                        drawerLabel: 'Orders',
                    }}
                />
                <Drawer.Screen
                    name="Customers" // This is the name of the page and must match the url from root
                    options={{
                        drawerLabel: 'Customers',
                    }}
                />
                <Drawer.Screen
                    name="Offers" // This is the name of the page and must match the url from root
                    options={{
                        drawerLabel: 'Offers',
                    }}
                />
                <Drawer.Screen
                    name="Settings" // This is the name of the page and must match the url from root
                    options={{
                        drawerLabel: 'Settings',
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
