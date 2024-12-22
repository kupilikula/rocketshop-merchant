import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*<Stack.Screen name='index' options={{header: ()=> null}}/>*/}
      {/*<Stack.Screen name='Product' options={{headerTitle: 'All Products'}}/>*/}
    </Stack>
  );
}
