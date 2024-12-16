import { Drawer } from 'expo-router/drawer';
import {DrawerToggleButton} from "@react-navigation/drawer";
import KadaiLogo from "../../components/KadaiLogo";
import {Stack, usePathname, useRouter} from "expo-router";
import {Text} from 'react-native-paper';
import {getFocusedRouteNameFromRoute} from "@react-navigation/core";
import DrawerMenu from "../../components/DrawerMenu";
import AppHeader from "../../components/AppHeader";

export default function Layout() {

    const router = useRouter();
    const pathName = usePathname();

    return <Drawer initialRouteName={'(tabs)'} backBehavior={'history'} screenOptions={({route}) =>  ({
        drawerPosition: 'right',
        drawerType: 'front',
        // headerRight: () => <DrawerToggleButton/>,
        // headerLeft: () => <KadaiLogo/>,
        headerShadowVisible: true,
        headerTitle: '',
        // headerStyle: {height: 60, backgroundColor: 'red'},
        drawerStyle: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0},
        header: () => {
            console.log('pathName:', pathName);
            return pathName.startsWith('/Main/AddNewProduct') ? null : <AppHeader/>
        }
        // headerLeft: () => {
        //     if (pathName.startsWith('/Main/StoreFront/Collections/Collection/')) {
        //         return <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        //             <Pressable onPress={router.back}>
        //                 <MaterialIcons name={'arrow-back'} size={36} style={{margin: 10}}/>
        //             </Pressable>
        //             <Text variant={'titleLarge'} style={{marginLeft: 15}} >Collection</Text>
        //         </View>
        //     } else if (pathName.startsWith('/Main/StoreFront/Products/Product/')) {
        //         return <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        //             <Pressable onPress={router.back} style={{margin: 10}}>
        //                 <MaterialIcons name={'arrow-back'} size={36}/>
        //             </Pressable>
        //             <Text variant={'titleLarge'} style={{marginLeft: 15}}>Product</Text>
        //         </View>
        //     } else if (pathName==='/Main/StoreFront/Products') {
        //         return <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        //             <Pressable onPress={router.back} style={{margin: 10}}>
        //                 <MaterialIcons name={'arrow-back'} size={36}/>
        //             </Pressable>
        //             <Text variant={'titleLarge'} style={{marginLeft: 15}}>Products</Text>
        //         </View>
        //     } else if (pathName==='/Main/StoreFront/Collections') {
        //         return <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        //             <Pressable onPress={router.back} style={{margin: 10}}>
        //                 <MaterialIcons name={'arrow-back'} size={36}/>
        //             </Pressable>
        //             <Text variant={'titleLarge'} style={{marginLeft: 15}}>Collections</Text>
        //         </View>
        //     } else
        //     {
        //         return <KadaiLogo/>
        //     }
        //
        // },
    })}
    drawerContent={(props) => <DrawerMenu {...props}/>}>
        {/*<Drawer.Screen*/}
        {/*    name="LandingPage" // This is the name of the page and must match the url from root*/}
        {/*    options={{*/}
        {/*        drawerLabel: 'StoreFront',*/}
        {/*    }}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*    name="Products" // This is the name of the page and must match the url from root*/}
        {/*    options={{*/}
        {/*        drawerLabel: 'Products',*/}
        {/*    }}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*    name="Collections" // This is the name of the page and must match the url from root*/}
        {/*    options={{*/}
        {/*        drawerLabel: 'Collections',*/}
        {/*    }}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*    name="Collection/[collectionId]" // This is the name of the page and must match the url from root*/}
        {/*    options={{*/}
        {/*        drawerLabel: () => null,*/}
        {/*    }}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*    name="Orders" // This is the name of the page and must match the url from root*/}
        {/*    options={{*/}
        {/*        drawerLabel: 'Orders',*/}
        {/*    }}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*    name="Customers" // This is the name of the page and must match the url from root*/}
        {/*    options={{*/}
        {/*        drawerLabel: 'Customers',*/}
        {/*    }}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*    name="Offers" // This is the name of the page and must match the url from root*/}
        {/*    options={{*/}
        {/*        drawerLabel: 'Offers',*/}
        {/*    }}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*    name="Settings" // This is the name of the page and must match the url from root*/}
        {/*    options={{*/}
        {/*        drawerLabel: 'Settings',*/}
        {/*    }}*/}
        {/*/>*/}
    </Drawer>
}
