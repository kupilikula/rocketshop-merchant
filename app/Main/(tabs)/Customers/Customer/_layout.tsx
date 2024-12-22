import {Stack, useRouter} from "expo-router";
import {Pressable, View} from "react-native";
import {generateBoxShadowStyle} from "@/styles/generateShadow";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {Text} from "react-native-paper";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function Layout() {

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const CustomerScreenHeader = () => {
    return <View style={[generateBoxShadowStyle(0,4,'#171717', 0.2, 3, 4, '#171717'),{height: 60 + insets.top, paddingTop: insets.top, paddingHorizontal: 15, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: 'white'}]}>
      <Pressable onPressIn={() => { router.back()}} style={{flex: 1}}>
        <MaterialIcons name={'arrow-back'} size={36} style={{color: 'black'}}/>
      </Pressable>
      <Text variant={'titleLarge'} style={{ color: 'black'}}>Customer Details</Text>
      <View style={{flex: 1}}/>
    </View>;
  }

  return (
      <Stack screenOptions={{header: CustomerScreenHeader}}/>
  )
}
