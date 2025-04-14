import { Stack } from "expo-router";
import GenericHeader from "../../../../components/GenericHeader";

export default function Layout() {
    // const router = useRouter();
    // const pathName = usePathname();

    return (
        <Stack
            screenOptions={{ header: () => null }}
            initialRouteName={"index"}>
            <Stack.Screen name='index' options={{header: ()=> <GenericHeader title='Store Settings'/>}}/>
            <Stack.Screen name='EditStoreDetails' options={{header: ()=> <GenericHeader title='Store Details'/>}}/>
            <Stack.Screen name='EditPaymentSettings' options={{header: ()=> <GenericHeader title='Payment Settings'/>}}/>
            <Stack.Screen name='MerchantManagement' options={{header: ()=> <GenericHeader title='Merchant Management'/>}}/>
        </Stack>
    );
}
