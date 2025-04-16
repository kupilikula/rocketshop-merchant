import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { setNewStoreFirstCollectionName } from '../../store/newStoreSlice';
import LogoIconWithName from "../../components/LogoIconWithName";

export default function CreateFirstCollection() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const router = useRouter();

    const [collectionName, setCollectionName] = useState('Featured'); // Default name
    const [error, setError] = useState(null);

    const handleNext = () => {
        if (!collectionName.trim()) {
            setError('Collection name is required');
            return;
        }

        dispatch(setNewStoreFirstCollectionName(collectionName.trim()));
        router.push('/CreateStore/StoreSettings');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: 'white' }}
        >
            <ScrollView contentContainerStyle={styles.container}   keyboardShouldPersistTaps="handled">
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleLarge" style={{ marginBottom: 24 }}>
                    Create Your First Collection
                </Text>

                <TextInput
                    label="Collection Name"
                    mode="outlined"
                    value={collectionName}
                    onChangeText={(text) => {
                        setCollectionName(text);
                        setError(null);
                    }}
                    style={{ marginBottom: 8, backgroundColor: 'white' }}
                />

                {error && <Text style={{ color: theme.colors.error, marginBottom: 16 }}>{error}</Text>}

                <View style={{display: 'flex', alignSelf: 'center', justifyContent: 'center'}}>
                <Button
                    mode="contained"
                    onPress={handleNext}
                    style={{ borderRadius: 8, marginTop: 8 }}
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
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'white',
    },
});