import { Stack } from 'expo-router';
import GenericHeader from "@/components/GenericHeader";
import {useTheme} from "react-native-paper";

export default function MerchantSettingsLayout() {

    const theme = useTheme();
    return (
        <Stack
            screenOptions={{contentStyle: {backgroundColor: theme.colors.surface} }}>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Merchant Settings',
                    header: () => <GenericHeader title={'Merchant Settings'}/>
                }}
            />
            {/*<Stack.Screen*/}
            {/*    name="NotificationPreferences"*/}
            {/*    options={{*/}
            {/*        title: 'Notifications',*/}
            {/*        header: () => <GenericHeader title={'Notifications'} right={null}/>*/}
            {/*    }}*/}
            {/*/>*/}
        </Stack>
    );
}