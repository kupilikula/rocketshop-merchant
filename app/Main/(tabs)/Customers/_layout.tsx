import { Stack } from "expo-router";
import GenericHeader from "@/components/GenericHeader";

export default function Layout() {
  return <Stack screenOptions={{ header: () => null }}>
    <Stack.Screen name='index' options={{ header: () => <GenericHeader title={'Customers'}/> }}/>
    <Stack.Screen name='[customerId]' options={{ header: () => <GenericHeader title={"Customer Details"}/> }}/>
  </Stack>;
}
