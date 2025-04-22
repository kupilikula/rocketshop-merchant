import { Stack } from "expo-router";
import GenericHeader from "@/components/GenericHeader";

export default function Layout() {
  return (
    <Stack
      initialRouteName={"index"}
    >
     <Stack.Screen name='index' options={{header: ()=> <GenericHeader title={'Offers'}/>}}/>
      <Stack.Screen name='Offer' options={{header: ()=> null}}/>
    </Stack>
  );
}
