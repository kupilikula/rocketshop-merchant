import {View} from "react-native";
import {Image} from "expo-image";
import {Text} from 'react-native-paper'


export const SearchResultProduct = (props) => {
     return <View style={{height: 60, borderStyle: 'solid', borderWidth: 1, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
         <Image source={props.product.mediaItems[0].uri} style={{width: 60, height: 60}}/>
         <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', height: '100%', marginLeft: 5}}>
         <Text variant={'titleMedium'}>{props.product.productName}</Text>
             <Text variant={'bodyLarge'}>{'₹' + props.product.price}</Text>
         </View>
     </View>
}