import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Colors} from "@/styles/Colors";
import {Text, useTheme} from "react-native-paper";
import {View} from 'react-native';
import {Image} from 'expo-image';
import {Platform} from "react-native";


export default function KadaiLogo() {
    const theme = useTheme();

    return <View style={{height: 58, backgroundColor: 'white', top: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',}}>
        <Image source={require('../assets/images/KadaiLogoIcon.svg')} style={{width:50, height: 50, margin: 5}}/>
        <Text style={{fontFamily: Platform.select({
                android: 'Atma_600SemiBold',
                ios: 'Atma-SemiBold',
            }), color: theme.colors.secondary, fontSize: 26}}>PocketShop</Text>
    </View>
}