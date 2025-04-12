// components/AppShell.js
import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import StoreSelectorHeader from "@/components/StoreSelectorHeader";

export default function AppShell() {

    return (
        <View style={{ flex: 1 }}>
            <Stack>
                <Stack.Screen name="index"  options={{ headerShown: false }}/>
                <Stack.Screen name="Main"  options={{ headerShown: false }}/>
                <Stack.Screen name="Authentication"  options={{ headerShown: false }}/>
                <Stack.Screen name="StoreSelector"  options={{ header: () => <StoreSelectorHeader /> }}/>
            </Stack>
        </View>
    );
}