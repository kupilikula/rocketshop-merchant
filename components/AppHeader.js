import {View, Text, Pressable} from "react-native";
import {Image} from 'expo-image';
import {Colors} from "@/styles/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import { ReactComponent as Logo } from '../assets/images/kadailogo.svg';
import { useFonts } from 'expo-font';
import KadaiLogo from './KadaiLogo';
import {DrawerActions} from "@react-navigation/native";
import {useNavigation} from "expo-router";
import {useTheme} from "react-native-paper";
export default function AppHeader (props)  {

    const navigation = useNavigation();
    const theme = useTheme();
    // const [loaded, error] = useFonts({
    //     'CaveatBrush-Regular': require('../assets/fonts/CaveatBrush-Regular.ttf'),
    // });
    // console.log('loaded:', loaded);
    // console.log('error:', error);


    return <View style={{height: 60, backgroundColor: 'white', display: 'flex', flexDirection:'row', alignItems: 'center', borderBottomWidth: 1, borderColor: 'gray', justifyContent: 'space-between'}}>
        <KadaiLogo/>
        <Pressable onPress={() => navigation.dispatch(DrawerActions.toggleDrawer()) }>
            <View style={{ width: 40, height: 40, margin: 10, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <MaterialIcons name={'menu'} size={28} style={{color: theme.colors.primary}}/>
            </View>
        </Pressable>
    </View>
}