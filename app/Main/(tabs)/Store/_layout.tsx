import { Stack } from "expo-router";
import {useTheme} from "react-native-paper";
import GenericHeader from "@/components/GenericHeader";

export default function Layout() {
  // const router = useRouter();
  // const pathName = usePathname();
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{ header: () => null, contentStyle: {backgroundColor: theme.colors.surface} }}
      initialRouteName={"StoreFront"}>
      <Stack.Screen name={'StoreFront'} options={{header: () => <GenericHeader title={'Store Front'}/>}}/>
      <Stack.Screen name={'StoreProductsSearch'} options={{header: () => <GenericHeader title={'Store Products'}/>}}/>
      <Stack.Screen name={'FollowersList'} options={{header: () => <GenericHeader title={'Followers'}/>}}/>
    </Stack>
  );
}
