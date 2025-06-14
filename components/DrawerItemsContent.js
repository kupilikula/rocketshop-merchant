// Create a new file, e.g., src/components/DrawerItemsContent.js
// (Adjust path based on your project structure)

import React from 'react';
import {View, StyleSheet, Pressable, Platform} from 'react-native';
import {Drawer, Text, useTheme, Badge, IconButton} from 'react-native-paper';
import { usePathname, useRouter } from 'expo-router';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcon from "react-native-paper/src/components/MaterialCommunityIcon"; // Corrected path
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/actions/logout"; // Adjust path: from WebHeader, this might be ../../store/actions/logout
// For openAuthModal, ensure path is correct relative to this new file
// Assuming openAuthModal is in authSlice.js and DrawerItemsContent is in components/
import { openAuthModal } from '../store/authSlice';
import {
    getCollectionsPath, getCustomersPath,
    getDashboardPath,
    getFollowedStoresPath, getMerchantSettingsPath,
    getMessagingPath, getOffersPath,
    getOrdersPath, getProductsPath,
    getSavedItemsPath,
    getSettingsPath, getStoreFrontPath, getStoreSelectorPath, getStoreSettingsPath
} from "../utils/getPathUtils";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {StoreLogo} from "./StoreLogo"; // Adjust path


const IS_WEB = Platform.OS === 'web';
const MENU_LABEL_VARIANT = IS_WEB ? 'titleMedium' : 'titleLarge';
const DrawerItemsContent = ({ onItemPress }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const pathName = usePathname(); // Not used in JSX, but kept from original
    const theme = useTheme();
    const styles = makeStyles(theme); // Use the same makeStyles as original DrawerMenu
    const {storeName, storeLogoImage, canReceiveMessages, merchantRole} = useSelector(state => state.store);
    const isAuthenticated = useSelector(state => state.auth.authenticationStatus==='AUTHENTICATED');
    const unreadCount = useSelector((state) => {
        const unread = state.badges.unreadMessages;
        if (!unread) return 0;
        return Object.values(unread).reduce((total, messages) => total + messages.length, 0);
    });


    const handlePress = (path) => {
        console.log('handlePress called');
        router.push(path);
        if (onItemPress) {
            console.log('onItemPress called');
            onItemPress(); // Close the drawer/modal
        }

    };

    const handleLogoutPress = async () => {
        try {
            await dispatch(logout(router));
        } catch (err) {
            console.log('error during logout:', err);
        }
        if (onItemPress) onItemPress();
    };

    const handleLoginPress = () => {
        // For web, we'll use the new openAuthModal flow.
        // For mobile, if /Authentication is a full screen, router.push is fine.
        // To unify, we could always use openAuthModal if it's set up to work on both.
        // For now, sticking to user's original for mobile, adapting for web via IS_WEB if needed,
        // or just dispatching openAuthModal if WebHeader is the only consumer of this for web.
        // Since this component is shared, let's assume openAuthModal is the preferred way.
        if (IS_WEB) {
            dispatch(openAuthModal({ reason: 'drawerLoginClick' }));
        } else {
            router.push('/Authentication');
        }

        if (onItemPress) onItemPress();
    };


    return (
        <View style={{flex: 1, paddingTop: IS_WEB ? 20 : 0}}>
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 15,
                }}
            >
                <StoreLogo logoImage={storeLogoImage} size={40} />
                <Text variant={"titleLarge"} style={{ marginLeft: 15 }}>
                    {storeName}
                </Text>
            </View>
            {IS_WEB && <Drawer.Item
                label={<Text variant={MENU_LABEL_VARIANT}>Dashboard</Text>}
                style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
                onPress={() => {
                    handlePress(getDashboardPath());
                }}
                icon={({ size, color }) => <MaterialIcons name={"dashboard"} size={size} />}
            />}
            {IS_WEB && <Drawer.Item
              label={<Text variant={MENU_LABEL_VARIANT}>Store Front</Text>}
              style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
              onPress={() => {
                handlePress(getStoreFrontPath());
              }}
              icon={({ size, color }) => <MaterialIcons name={"store"} size={size} />}
            />}
            {IS_WEB && <Drawer.Item
              label={<Text variant={MENU_LABEL_VARIANT}>Products</Text>}
              style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
              onPress={() => handlePress(getProductsPath())}
              icon={({ size, color }) => (
                <MaterialIcons name={"shopping-bag"} size={size} />
              )}
            />}
            <Drawer.Item
                label={<Text variant={MENU_LABEL_VARIANT}>Collections</Text>}
                style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
                onPress={() => {
                    handlePress(getCollectionsPath());
                }}
                icon={({ size, color }) => (
                    <MaterialIcons name={"category"} size={size} />
                )}
            />
            {IS_WEB && <Drawer.Item
              label={<Text variant={MENU_LABEL_VARIANT}>Orders</Text>}
              style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
              onPress={() => handlePress(getOrdersPath())}
              icon={({ size, color }) => (
                <MaterialIcons name={"receipt-long"} size={size} />
              )}
            />}
            <Drawer.Item
                label={<Text variant={MENU_LABEL_VARIANT}>Customers</Text>}
                style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
                onPress={() => handlePress(getCustomersPath())}
                icon={({ size, color }) => <MaterialIcons name={"hail"} size={size} />}
            />
            <Drawer.Item
                label={<Text variant={MENU_LABEL_VARIANT}>Offers</Text>}
                style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
                onPress={() => handlePress(getOffersPath())}
                icon={({ size, color }) => (
                    <MaterialIcons name={"discount"} size={size} />
                )}
            />
            {canReceiveMessages &&
                <Drawer.Item label={<Text variant={MENU_LABEL_VARIANT}>Messages</Text>}
                             style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                             onPress={() => {handlePress(getMessagingPath())}}
                             icon={({ size, color }) => (
                                 <View style={styles.iconContainer}>
                                     <MaterialIcons name="chat" size={size} color={color} />
                                     {unreadCount > 0 && (
                                         <Badge style={styles.badge}>{unreadCount}</Badge>
                                     )}
                                 </View>
                             )}
                />}
            {(merchantRole === 'Admin' || merchantRole === 'Manager') &&
                <Drawer.Item
                    label={<Text variant={MENU_LABEL_VARIANT}>Store Settings</Text>}
                    style={{ padding: 0, borderRadius: 5, marginLeft: 0 }}
                    onPress={() => handlePress(getStoreSettingsPath())}
                    icon={({ size, color }) => (
                        <MaterialCommunityIcons name={"store-cog"} size={size} />
                    )}
                />
            }
            <Drawer.Item label={<Text variant={MENU_LABEL_VARIANT}>Merchant Settings</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={  () => handlePress(getMerchantSettingsPath())}
                         icon={({size, color}) => <MaterialIcons name={'manage-accounts'} size={size}/>}/>

            <Drawer.Item label={<Text variant={MENU_LABEL_VARIANT}>Switch Store</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={  () => handlePress(getStoreSelectorPath())}
                         icon={({size, color}) => <MaterialIcons name={'change-circle'} size={size}/>}/>
            {isAuthenticated && <Drawer.Item label={<Text variant={MENU_LABEL_VARIANT}>Log out</Text>}
                         style={{padding: 0, borderRadius: 5, marginLeft: 0}}
                         onPress={ async () => {
                             await handleLogoutPress()
                         }}
                         icon={({size, color}) => <MaterialIcons name={'logout'} size={size}/>}/>}
        </View>
    );
};

// makeStyles from user's original DrawerMenu.js
const makeStyles = (theme) => StyleSheet.create({
    drawerItemStyle: { // Applied to all Drawer.Item components
        padding: 0,
        borderRadius: 5,
        marginLeft: 0, // As per original
        // Add some vertical margin for better spacing if needed
        // marginVertical: 2,
    },
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -5,  // Adjusted for better positioning on icon
        right: -8, // Adjusted
        // Original had more specific styling, this uses Paper Badge defaults mostly
        // backgroundColor: 'red', // Default is theme.colors.error
        // color: 'white',
    },
});

export default DrawerItemsContent;