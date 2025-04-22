import { Stack } from "expo-router";
import GenericHeader from "@/components/GenericHeader";

export default function Layout() {
  return <Stack screenOptions={{ header: () => null }}>
    <Stack.Screen name='index' options={{ header: () => <GenericHeader title={'Customers'}/> }}/>
    <Stack.Screen name='Customer' options={{ header: () => null }}/>
  </Stack>;
}
