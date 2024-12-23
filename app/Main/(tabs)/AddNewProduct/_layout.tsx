import { Stack } from "expo-router";

export default function AddNewProductStack() {
  return (
    <Stack initialRouteName={"index"}>
      <Stack.Screen name={"index"} options={{ header: () => null }} />
      <Stack.Screen
        name={"AddMediaItems"}
        options={{
          title: "Product Media",
        }}
      />
      <Stack.Screen
        name={"AddProductInfo"}
        options={{
          title: "Product Info",
        }}
      />
    </Stack>
  );
}
