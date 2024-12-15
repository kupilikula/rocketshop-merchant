import {Stack, useRouter} from "expo-router";
import {Pressable} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Colors} from "@/styles/Colors";
import {useTheme} from "react-native-paper";


export default function AddNewProductStack() {

    const router = useRouter();
    const theme = useTheme(); // Access the theme here

    return <Stack initialRouteName={'AddMediaItems'}>
        <Stack.Screen
            name={'AddMediaItems'}
            options={{
                title: 'Add Product Media',
                headerStyle: { backgroundColor: theme.colors.secondary },
                headerTintColor: 'white',
                headerTitleStyle: {
                    // fontWeight: 'bold',
                },
                headerRight: () => <Pressable onPressIn={() => {console.log('press'); router.push('./AddProductInfo')}}><MaterialIcons name={'arrow-forward'} size={36} style={{color: 'white'}}/></Pressable>
            }}
        />
        <Stack.Screen
            name={'AddProductInfo'}
            options={{
                title: 'Add Product Info',
                headerStyle: { backgroundColor: theme.colors.secondary },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    // fontWeight: 'bold',
                },
                // headerRight: () => <Pressable onPress={() => router.push('./AddProductInfo')}><MaterialIcons name={'arrow-forward'} size={36}/></Pressable>
            }}
        />

    </Stack>
}