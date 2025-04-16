import {Stack} from "expo-router";
import GenericHeader from "../../../../components/GenericHeader";

export default function StoreLayout () {

    return <Stack screenOptions={{headerShown: true}} >
        <Stack.Screen name={'index'} options={{header: () => <GenericHeader title={'Messages'}/>}}/>
        <Stack.Screen name={'chat'} options={{header: () => null}}/>
    </Stack>
}


