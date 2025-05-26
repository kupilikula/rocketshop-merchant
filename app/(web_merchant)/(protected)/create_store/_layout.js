import {Stack} from "expo-router";
import GenericHeader from "../../../../components/GenericHeader";

export default function StoreLayout () {

    return <Stack initialRouteName={'index'}  screenOptions={{headerShown: true, header: () => <GenericHeader title={'Create New Store'}/>, backgroundColor: 'white'}} >
        <Stack.Screen name={'index'} />
        <Stack.Screen name={'store_handle'} />
        <Stack.Screen name={'store_description'} />
        <Stack.Screen name={'store_logo'} />
        <Stack.Screen name={'store_tags'} />
        <Stack.Screen name={'first_collection'} />
        <Stack.Screen name={'store_summary'} />
    </Stack>
}


