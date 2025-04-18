// components/AppShell.js
import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import StoreSelectorHeader from "@/components/StoreSelectorHeader";
import {useTheme} from "react-native-paper";

export default function AppShell() {

    const theme = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
            <Stack screenOptions={{ header: () => null, contentStyle: {backgroundColor: theme.colors.surface}} }>
                <Stack.Screen name="index"  options={{ headerShown: false }}/>
                <Stack.Screen name="Main"  options={{ headerShown: false }}/>
                <Stack.Screen name="Authentication"  options={{ headerShown: false }}/>
                <Stack.Screen name="StoreSelector"  options={{ headerShown: false }}/>
                <Stack.Screen name="CreateStore"  options={{ headerShown: false }}/>
            </Stack>
        </View>
    );
}