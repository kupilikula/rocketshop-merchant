import { Stack } from "expo-router";
import GenericHeader from "@/components/GenericHeader";

export default function Layout() {
  return <Stack screenOptions={{ }} >
    <Stack.Screen name='index' options={{header: () => <GenericHeader title={'Collections'}/> }}/>
    <Stack.Screen name='Other' options={{header: () => null  }}/>
    <Stack.Screen name='[collectionId]' options={{header: () => <GenericHeader title={"Collection Details"} />  }}/>
  </Stack>;
}
