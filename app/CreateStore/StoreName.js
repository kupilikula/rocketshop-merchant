import React, { useState } from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setNewStoreName } from '../../store/newStoreSlice';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";

export default function StoreNameScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();

    const storeName = useSelector((state) => state.newStore.storeName);
    const [localStoreName, setLocalStoreName] = useState(storeName);
    // const [error, setError] = useState('');

    const handleNext = () => {
        if (!localStoreName.trim()) {
            // setError('Store name is required');
            return;
        }
        dispatch(setNewStoreName(localStoreName.trim()));
        router.push('/CreateStore/StoreHandle'); // Move to next step
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: 'white'}}
        >
            <ScrollView contentContainerStyle={styles.container}  keyboardShouldPersistTaps="handled">
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleLarge" style={styles.heading}>
                    Enter Store Name
                </Text>
                <TextInput
                    label="Store Name"
                    mode="outlined"
                    // value={localStoreName}
                    onChangeText={(text) => {
                        setLocalStoreName(text);
                        // if (error) setError('');
                    }}
                    style={styles.input}
                    // error={!!error}
                />
                {/*{error ? (*/}
                {/*    <Text style={{ color: theme.colors.error, marginBottom: 8 }}>*/}
                {/*        {error}*/}
                {/*    </Text>*/}
                {/*) : null}*/}
                <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center'}}>
                <Button mode="contained" onPress={handleNext} style={{ borderRadius: 8 }}>
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
    },
    heading: {
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
});