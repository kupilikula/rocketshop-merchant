import { Stack } from 'expo-router';

export default function ShippingLayout() {
  return (
      <Stack>
        <Stack.Screen
            name="index"
            options={{
              title: 'Shipping Rules',
            }}
        />
        <Stack.Screen
            name="AddEditShippingRule"
            options={{
              title: 'Shipping Rule',
            }}
        />
      </Stack>
  );
}