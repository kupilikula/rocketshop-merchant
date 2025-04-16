import React, { useState } from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setNewStoreDescription } from '../../store/newStoreSlice';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";

export default function StoreDescription() {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();

    const storeDescription = useSelector((state) => state.newStore.storeDescription);
    const [description, setDescription] = useState(storeDescription || '');
    const [error, setError] = useState('');

    const handleNext = () => {
        if (!description.trim()) {
            setError('Store description is required.');
            return;
        }

        dispatch(setNewStoreDescription(description.trim()));
        router.push('/CreateStore/StoreLogo');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: 'white' }}
        >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
            <Text variant="titleLarge" style={styles.heading}>Describe Your Store</Text>
            <TextInput
                label="Store Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                error={!!error}
            />
            {error ? <Text style={{ color: theme.colors.error }}>{error}</Text> : null}

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