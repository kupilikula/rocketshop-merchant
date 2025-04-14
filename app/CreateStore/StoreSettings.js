import React, { useState } from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";

import GstSettingsComponent from "../../components/GstSettingsComponent";
import {setNewStoreSettings} from "../../store/newStoreSlice";

export default function StoreDescription() {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();

    const storeSettings = useSelector((state) => state.newStore.storeSettings);
    const [gstRate, setGstRate] = useState(storeSettings?.gstRate || 0);
    const [gstInclusive, setGstInclusive] = useState(storeSettings?.gstInclusive || false);

    const handleNext = () => {
        dispatch(setNewStoreSettings({defaultGstRate: gstRate, defaultGstInclusive: gstInclusive}));
        router.push('/CreateStore/StoreSummary');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: 'white' }}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                    <GstSettingsComponent rate={gstRate} setRate={setGstRate} inclusive={gstInclusive} setInclusive={setGstInclusive}/>
                    <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center'}}>
                        <Button
                            mode="contained"
                            onPress={handleNext}
                            style={styles.button}
                        >
                            Next
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    heading: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
        minHeight: 100,
    },
    button: {
        borderRadius: 8,
    },
});