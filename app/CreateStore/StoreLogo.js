import React, { useState } from 'react';
import {View, StyleSheet, Alert, ScrollView, Platform} from 'react-native'; // Added Platform
import { Text, Button, useTheme, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { setNewStoreLogoImage } from '../../store/newStoreSlice';
import { useRouter } from 'expo-router';
import LogoIconWithName from "../../components/LogoIconWithName";

const IS_WEB = Platform.OS === 'web';

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

        if (!result.canceled && result.assets && result.assets.length > 0) { // Ensure assets exist
            const uri = result.assets[0].uri;
            setLocalImage(uri);
        }
    };

    const handleNext = () => {
        console.log('localImage:', localImage); // Kept original console.log
        if (!localImage) return; // Guard in case button was somehow enabled
        dispatch(setNewStoreLogoImage(localImage));
        router.push(IS_WEB ? '/create_store/store_tags' : '/CreateStore/StoreTags');
    };

    return (
        // ScrollView is the root layout component here for content
        <ScrollView style={{backgroundColor: 'white'}} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            {/* The inner View with flex: 1, justifyContent: 'center', alignItems: 'center'
              was present in the original code. styles.container already has these,
              but this inner View ensures its direct children are also arranged this way if
              styles.container had different alignments for some reason.
              For this specific case, since styles.container has these properties,
              this inner View mainly serves to group all content.
            */}
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' /* Ensure inner view takes up dictated width */}}>
                <LogoIconWithName style={{alignSelf: 'center', marginBottom: 24}}/>
                <Text variant="titleLarge" style={styles.heading}>Add Store Logo</Text>

                <View style={styles.logoContainer}>
                    {localImage ? (
                        <Avatar.Image size={120} source={{ uri: localImage }} />
                    ) : (
                        <Avatar.Icon size={120} icon="image" style={{ backgroundColor: theme.colors.secondaryContainer /* Changed for better contrast potentially */ }} />
                    )}
                </View>

                <Button
                    mode="contained"
                    onPress={pickImage}
                    style={[styles.button, {backgroundColor: theme.colors.primary}]}
                    // labelStyle={{paddingVertical: 4}}
                >
                    Select Image
                </Button>

                {localImage && (
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        // disabled={!localImage} // Already handled by conditional rendering
                        style={[styles.button]}
                        // labelStyle={{paddingVertical: 4}}
                    >
                        Next
                    </Button>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, // Allows container to grow and fill ScrollView
        padding: 16,
        justifyContent: 'center', // Centers children vertically
        alignItems: 'center',   // Centers children horizontally
        backgroundColor: 'white',
        // Web-specific white for a centered, max-width layout
        ...(Platform.OS === 'web' && {
            width: '100%',       // Takes full width of its parent (ScrollView viewport)
            // maxWidth: 700,       // Constrains content width on web (e.g., 500px)
            alignSelf: 'center', // Centers the content block if ScrollView viewport is wider
        }),
    },
    heading: {
        marginBottom: 24,
        textAlign: 'center', // Ensure heading text is centered
    },
    logoContainer: {
        marginBottom: 24,
        // backgroundColor: 'white', // Kept commented as in original
    },
    button: {
        marginTop: 16, // Increased margin for better spacing between buttons
        borderRadius: 8,
        // width: '60%', // Kept commented as in original, explicit width set inline instead
    },
});