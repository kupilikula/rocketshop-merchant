import {Stack, useRouter} from "expo-router";
import {Pressable, TouchableOpacity, View} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Colors} from "@/styles/Colors";
import {Button, Text, useTheme} from "react-native-paper";


export default function AddNewProductStack() {

    const router = useRouter();
    const theme = useTheme(); // Access the theme here

    return <Stack initialRouteName={'index'} >
        <Stack.Screen name={'index'} options={{header: () => null}}/>
        <Stack.Screen
            name={'AddMediaItems'}
            options={{
                title: 'Product Media',
                // headerStyle: { backgroundColor: theme.colors.secondary },
                // headerTintColor: 'white',
                // headerTitleStyle: {
                //     // fontWeight: 'bold',
                // },
                // headerRight: () => <Pressable onPressIn={() => {console.log('press'); router.push('./AddProductInfo')}}><MaterialIcons name={'arrow-forward'} size={36} style={{color: 'white'}}/></Pressable>
            }}
        />
        <Stack.Screen
            name={'AddProductInfo'}
            options={({navigation}) => ({
                title: 'Product Info',
            })}
        />

    </Stack>
}