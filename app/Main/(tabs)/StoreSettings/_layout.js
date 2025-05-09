import { Stack } from "expo-router";
import GenericHeader from "../../../../components/GenericHeader";
import {useTheme} from "react-native-paper";
import {useSelector, useStore} from "react-redux";

export default function Layout() {
    // const router = useRouter();
    // const pathName = usePathname();
    const store = useSelector(state => state.store);
    const theme = useTheme();

    return (
        <Stack
            screenOptions={{ header: () => null, contentStyle: {backgroundColor: theme.colors.surface} }}
            initialRouteName={"index"}>
            <Stack.Screen name='index' options={{header: ()=> <GenericHeader title='Store Settings'/>}}/>
            <Stack.Screen name='EditStoreDetails' options={{header: ()=> <GenericHeader title='Store Details'/>}}/>
            {!store.isPlatformOwned && <Stack.Screen name='PaymentSettings' options={{header: ()=> <GenericHeader title='Payment Settings'/>}}/>}
            <Stack.Screen name='MerchantManagement' options={{header: ()=> <GenericHeader title='Merchant Management'/>}}/>
            <Stack.Screen name='GstSettings' options={{header: ()=> <GenericHeader title='GST Settings'/>}}/>
        </Stack>
    );
}
