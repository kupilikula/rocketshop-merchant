import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import { Drawer, Text } from 'react-native-paper';
import {Link, useRouter} from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {View} from "react-native";
import {StoreLogo} from "@/components/StoreLogo";
import {faker} from '@faker-js/faker';

export default function DrawerMenu(props) {
    const router = useRouter();
    const storeLogoImage = faker.image.url();

    // console.log('props:', JSON.stringify(props));
    return (
        <DrawerContentScrollView {...props}>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                <StoreLogo logoImage={storeLogoImage} size={40}/>
                <Text variant={'displaySmall'} style={{marginLeft: 15}}>Store Name</Text>
            </View>
            <Drawer.Item label={<Text variant={'titleLarge'}>Store Front</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={() => {
                             router.push('/Main/(tabs)/Store/StoreFront')
                         }}
                         icon={({size, color}) => <MaterialIcons name={'store'} size={size}/>}/>
            <Drawer.Item label={<Text variant={'titleLarge'}>Products</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={() => router.push('/Main/(tabs)/Products')}
                         icon={({size, color}) => <MaterialIcons name={'shopping-bag'} size={size}/>}/>
            <Drawer.Item label={<Text variant={'titleLarge'}>Collections</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={() => {
                                 router.push('/Main/(tabs)/Collections')
                         }}
                         icon={({size, color}) => <MaterialIcons name={'category'} size={size}/>}/>
            <Drawer.Item label={<Text variant={'titleLarge'}>Orders</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={() => router.push('/Main/(tabs)/Orders')}
                         icon={({size, color}) => <MaterialIcons name={'receipt-long'} size={size}/>}/>
            <Drawer.Item label={<Text variant={'titleLarge'}>Customers</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={() => router.push('/Main/(tabs)/Customers')}
                         icon={({size, color}) => <MaterialIcons name={'hail'} size={size}/>}/>
            <Drawer.Item label={<Text variant={'titleLarge'}>Offers</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={() => router.push('/Main/(tabs)/Offers')}
                         icon={({size, color}) => <MaterialIcons name={'discount'} size={size}/>}/>
            <Drawer.Item label={<Text variant={'titleLarge'}>Settings</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={() => router.push('/Main/(tabs)/Settings')}
                         icon={({size, color}) => <MaterialIcons name={'settings'} size={size}/>}/>
        </DrawerContentScrollView>
    );
}