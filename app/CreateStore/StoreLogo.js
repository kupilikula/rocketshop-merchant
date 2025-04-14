import React, { useState } from 'react';
import {View, StyleSheet, Alert, ScrollView} from 'react-native';
import { Text, Button, useTheme, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { setNewStoreLogoImage } from '../../store/newStoreSlice';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";

export default function StoreLogo() {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();

    const storeLogoImage = useSelector((state) => state.newStore.storeLogoImage);
    const [localImage, setLocalImage] = useState(storeLogoImage || null);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Allow media access to select logo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Crop to square
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setLocalImage(uri);
        }
    };

    const handleNext = () => {
        console.log('localImage:', localImage);
        if (!localImage) return;
        dispatch(setNewStoreLogoImage(localImage));
        router.push('/CreateStore/StoreTags');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}   keyboardShouldPersistTaps="handled">
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
            <Text variant="titleLarge" style={styles.heading}>Add Store Logo</Text>

            <View style={styles.logoContainer}>
                {localImage ? (
                    <Avatar.Image size={120} source={{ uri: localImage }} />
                ) : (
                    <Avatar.Icon size={120} icon="image" backgroundColor={theme.colors.secondary} />
                )}
            </View>

            <Button
                mode="contained"
                onPress={pickImage}
                style={[styles.button, {backgroundColor: theme.colors.secondary}]}
            >
                Select Image
            </Button>

                {localImage &&
            <Button
                mode="contained"
                onPress={handleNext}
                disabled={!localImage}
                style={styles.button}
            >
                Next
            </Button>}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    heading: {
        marginBottom: 24,
    },
    logoContainer: {
        marginBottom: 24,
        // backgroundColor: 'white',
    },
    button: {
        marginTop: 12,
        borderRadius: 8,
        // width: '60%',
    },
});