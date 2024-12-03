import {View, Text} from "react-native";
import {Image} from 'expo-image';
import {Colors} from "@/styles/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
// import { ReactComponent as Logo } from '../assets/images/kadailogo.svg';
import { useFonts } from 'expo-font';
import KadaiLogo from './KadaiLogo';
export default function FeedHeader (props)  {


    const [loaded, error] = useFonts({
        'CaveatBrush-Regular': require('../assets/fonts/CaveatBrush-Regular.ttf'),
    });
    console.log('loaded:', loaded);
    console.log('error:', error);

    return <KadaiLogo />
}