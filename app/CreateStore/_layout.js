import {Stack} from "expo-router";
import GenericHeader from "../../components/GenericHeader";

export default function StoreLayout () {

    return <Stack screenOptions={{headerShown: true, header: () => <GenericHeader title={'Create New Store'}/>}} >
        <Stack.Screen name={'StoreName'} />
        <Stack.Screen name={'StoreHandle'} />
        <Stack.Screen name={'StoreDescription'} />
        <Stack.Screen name={'StoreLogo'} />
        <Stack.Screen name={'StoreTags'} />
        <Stack.Screen name={'CreateFirstCollection'} />
        <Stack.Screen name={'StoreSummary'} />
    </Stack>
}


