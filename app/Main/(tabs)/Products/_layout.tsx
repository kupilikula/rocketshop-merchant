import { Stack } from "expo-router";
import {useTheme} from "react-native-paper";
import GenericHeader from "@/components/GenericHeader";

export default function Layout() {

  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShown: true, contentStyle: { backgroundColor: theme.colors.surface} }}>
      <Stack.Screen name='index' options={{header: ()=> <GenericHeader title={'Products'}/>}}/>
      <Stack.Screen name='Product' options={{header: () => null}}/>
    </Stack>
  );
}
