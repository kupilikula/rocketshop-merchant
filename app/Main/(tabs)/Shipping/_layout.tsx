import { Stack } from 'expo-router';
import GenericHeader from "@/components/GenericHeader";
import {useTheme} from "react-native-paper";

export default function ShippingLayout() {

    const theme = useTheme();
    return (
      <Stack
          screenOptions={{contentStyle: {backgroundColor: theme.colors.surface} }}>
        <Stack.Screen
            name="index"
            options={{
              title: 'Shipping Rules',
                header: () =>null
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