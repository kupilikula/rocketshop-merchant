import { Stack } from "expo-router";
import GenericHeader from "../../../../../components/GenericHeader";

export default function AddNewProductStack() {


    return (
        <Stack initialRouteName={"index"} screenOptions={{contentStyle: {backgroundColor: 'white'}}}>
            <Stack.Screen name={"index"} options={{ header: () => <GenericHeader title={'Shipping Rule Selection'} right={null}/> }} />
            <Stack.Screen
                name={"select_existing"}
                options={{
                    title: "Select Existing Shipping Rule",
                    header: () => <GenericHeader title={'Select Shipping Rule'} right={null}/>,
                }}
            />
            <Stack.Screen
                name={"clone_existing"}
                options={{
                    title: "Clone Existing Shipping Rule",
                    header: () => <GenericHeader title={'Clone Shipping Rule'} right={null}/>,
                }}
            />
            <Stack.Screen
                name={"create_new"}
                options={{
                    title: "New Shipping Rule",
                    header: () => <GenericHeader title={'Create New Shipping Rule'} right={null}/>,
                }}
            />
        </Stack>
    );
}
