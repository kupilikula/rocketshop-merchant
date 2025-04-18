import { Stack } from "expo-router";
import {useTheme} from "react-native-paper";

export default function Layout() {

  const theme = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.surface} }}>
      {/*<Stack.Screen name='index' options={{header: ()=> null}}/>*/}
      {/*<Stack.Screen name='Product' options={{headerTitle: 'All Products'}}/>*/}
    </Stack>
  );
}
