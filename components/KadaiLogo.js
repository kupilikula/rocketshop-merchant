import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Colors} from "@/styles/Colors";
import {Text} from "react-native-paper";
import {View} from 'react-native';


export default function KadaiLogo() {
    return <View style={{height: 60, backgroundColor: 'white', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',}}>
        {/*<Logo fill={'red'} stroke={'green'}/>*/}
        {/*<View style={{width: 60, height: 60, borderRadius: 30, borderStyle: 'solid', borderWidth: 1, position: 'relative', justifyContent: 'center', alignItems: 'center'}}>*/}
        {/*<Image source={require('../assets/images/kadailogo.svg')} style={{width:40, height: 40, margin: 10}} stroke={'blue'}/>*/}
        {/*</View>*/}
        <MaterialIcons name={'shopping-cart-checkout'} size={28} style={{marginLeft: 10, color: Colors.shamrockGreen}}/>
        <View style={{marginLeft: 15, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontFamily: 'CaveatBrush-Regular', fontSize: 30, color: Colors.crimson}}>k</Text>
            <Text style={{fontFamily: 'CaveatBrush-Regular', fontSize: 30, color: Colors.vividSkyBlue}}>a</Text>
            <Text style={{fontFamily: 'CaveatBrush-Regular', fontSize: 30, color: Colors.pinkLavender}}>d</Text>
            <Text style={{fontFamily: 'CaveatBrush-Regular', fontSize: 30, color: Colors.shamrockGreen}}>a</Text>
            <Text style={{fontFamily: 'CaveatBrush-Regular', fontSize: 30, color: Colors.orange}}>i</Text>
            <Text style={{fontFamily: 'CaveatBrush-Regular', fontSize: 30, color: Colors.almostBlack}}>.</Text>
            <Text style={{fontFamily: 'CaveatBrush-Regular', fontSize: 30, color: Colors.indigo}}>b</Text>
            <Text style={{fontFamily: 'CaveatBrush-Regular', fontSize: 30, color: Colors.palatinateBlue}}>i</Text>
            <Text style={{fontFamily: 'CaveatBrush-Regular', fontSize: 30, color: Colors.darkGreen}}>z</Text>
        </View>
    </View>
}