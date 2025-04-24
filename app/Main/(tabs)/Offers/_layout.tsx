import { Stack } from "expo-router";
import GenericHeader from "@/components/GenericHeader";

export default function Layout() {
  return (
    <Stack
      initialRouteName={"index"}
    >
     <Stack.Screen name='index' options={{header: ()=> <GenericHeader title={'Offers'}/>}}/>
      <Stack.Screen name='[offerId]' options={{header: ()=> <GenericHeader title={"Offer Details"} />}}/>
        <Stack.Screen name='NewOffer' options={{header: ()=> <GenericHeader title={"New Offer Details"} />}}/>
    </Stack>
  );
}
