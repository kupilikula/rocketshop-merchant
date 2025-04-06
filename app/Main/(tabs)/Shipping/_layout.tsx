import { Stack } from 'expo-router';
import GenericHeader from "@/components/GenericHeader";

export default function ShippingLayout() {
  return (
      <Stack >
        <Stack.Screen
            name="index"
            options={{
              title: 'Shipping Rules',
                header: () => <GenericHeader title={'Shipping Rules'} right={null}/>
            }}
        />
        <Stack.Screen
            name="AddEditShippingRule"
            options={{
              title: 'Shipping Rule',
                header: () => <GenericHeader title={'Shipping Rule Details'} right={null}/>
            }}
        />
      </Stack>
  );
}