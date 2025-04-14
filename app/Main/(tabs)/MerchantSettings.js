import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Avatar, Switch, Text, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const MerchantSettingsScreen = () => {
    const [storeName, setStoreName] = useState("Store Name");
    const [storeLogo, setStoreLogo] = useState(null);
    const [isRazorpayConnected, setRazorpayConnected] = useState(false);
    const [orderNotifications, setOrderNotifications] = useState(true);
    const [storeVisibility, setStoreVisibility] = useState(true);

    const handleLogoChange = () => {
        // Logic to pick and upload a new logo
        console.log("Change Logo");
    };

    const handleRazorpayConnect = () => {
        // Logic to integrate Razorpay account
        console.log("Connect Razorpay");
    };

    const handleRazorpayDisconnect = () => {
        // Logic to disconnect Razorpay account
        console.log("Disconnect Razorpay");
    };

    const pickImage = async () => {
        // Ask for media library permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Denied", "You need to allow access to the gallery to select a logo.");
            return;
        }

        // Open image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // Enables cropping
            aspect: [1, 1], // Enforces square crop for circular display
            quality: 1,
        });

        if (!result.canceled) {
            setStoreLogo(result.assets[0].uri); // Set the selected image URI
        }
    };

    return (
        <View style={styles.container}>
            {/* Store Details Section */}
            <Text style={styles.sectionTitle}>Store Details</Text>
            <TextInput
                label="Store Name"
                value={storeName}
                onChangeText={(text) => setStoreName(text)}
                mode="outlined"
                style={styles.input}
            />
            <View style={styles.logoContainer}>
                <Avatar.Image
                    size={100}
                    source={{ uri: storeLogo || 'https://picsum.photos/200'}}
                />
                <Button mode="contained" onPress={pickImage} style={styles.changeLogoButton}>
                    Change Logo
                </Button>
            </View>
            <Divider style={styles.divider} />

            {/* Razorpay Section */}
            <Text style={styles.sectionTitle}>Razorpay Integration</Text>
            {isRazorpayConnected ? (
                <View style={styles.row}>
                    <Text>Connected to Razorpay</Text>
                    <Button mode="outlined" onPress={handleRazorpayDisconnect}>
                        Disconnect
                    </Button>
                </View>
            ) : (
                <Button mode="contained" onPress={handleRazorpayConnect}>
                    Connect Razorpay Account
                </Button>
            )}
            <Divider style={styles.divider} />

            {/* Preferences Section */}
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.row}>
                <Text>Order Notifications</Text>
                <Switch
                    value={orderNotifications}
                    onValueChange={(value) => setOrderNotifications(value)}
                />
            </View>
            <View style={styles.row}>
                <Text>Store Visibility</Text>
                <Switch
                    value={storeVisibility}
                    onValueChange={(value) => setStoreVisibility(value)}
                />
            </View>
            <Divider style={styles.divider} />

            {/* Support Section */}
            <Text style={styles.sectionTitle}>Support</Text>
            <Button mode="outlined" onPress={() => console.log('Help Center')}>
                Help Center
            </Button>
            <Button mode="outlined" onPress={() => console.log('Contact Support')}>
                Contact Support
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    input: {
        marginBottom: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    changeLogoButton: {
        marginLeft: 16,
    },
    divider: {
        marginVertical: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
    },
});

export default MerchantSettingsScreen;
