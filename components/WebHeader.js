// src/components/web/marketplace/WebHeader.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Platform,
    Keyboard,
    ScrollView,
    useWindowDimensions,
    TouchableOpacity, Text
} from 'react-native';
import {
    useTheme,
    Badge,
    Portal,
    Modal, IconButton
} from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { logout } from "../store/actions/logout"; // Ensure this path is correct
import LogoIconWithName from "./LogoIconWithName"; // Ensure this path is correct

import DrawerItemsContent from "./DrawerItemsContent";
import {openAuthModal} from "../store/authSlice";


const MIN_WIDTH_FOR_SEARCH = 700;
const IS_WEB = Platform.OS==='web';
const WEB_DRAWER_WIDTH = 280;

const WebHeader = () => {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();

    const isAuthenticated = useSelector((state) => state.auth.authenticationStatus === 'AUTHENTICATED');

    const { width } = useWindowDimensions(); // Get current window width
    const [isWebDrawerOpen, setIsWebDrawerOpen] = useState(false);
    const openWebDrawer = () => setIsWebDrawerOpen(true);
    const closeWebDrawer = () => setIsWebDrawerOpen(false);
    const handleLoginPress = () => {
        if (IS_WEB) {
            dispatch(openAuthModal({ reason: 'drawerLoginClick' }));
        } else {
            router.push('/Authentication');
        }

    };


    const handleLogout = () => {
        dispatch(logout(router));
    };

    const styles = makeStyles(theme);

    return (
        <>
            <View style={styles.headerContainer}>
                <View style={styles.leftSection}>
                    <Pressable onPress={() => router.push("/(web_marketplace)/")}>
                        <LogoIconWithName/>
                    </Pressable>
                </View>

                <View style={styles.rightSection}>
                    {!isAuthenticated && <TouchableOpacity onPress={() => handleLoginPress()} style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>Login / Register</Text>
                    </TouchableOpacity>}
                    {IS_WEB && (
                        <IconButton
                            icon="menu"
                            size={28}
                            onPress={openWebDrawer}
                            color={theme.colors.onSurface} // Or your desired color
                            style={{ marginLeft: -8 }} // Adjust spacing if needed
                        />
                    )}
                </View>
            </View>

            {IS_WEB && (
                <Portal>
                    <Modal
                        visible={isWebDrawerOpen}
                        onDismiss={closeWebDrawer}
                        contentContainerStyle={[styles.webDrawerModalContent, {width: WEB_DRAWER_WIDTH}]} // Apply width here
                        style={styles.webDrawerModalOverlay} // For positioning if needed
                        theme={theme}
                    >
                        <ScrollView style={styles.drawerScrollView}>
                            <DrawerItemsContent onItemPress={closeWebDrawer} />
                        </ScrollView>
                    </Modal>
                </Portal>
            )}
        </>
    );
};

const makeStyles = (theme) => StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Platform.OS === 'web' ? 15 : 10,
        paddingHorizontal: Platform.OS === 'web' ? 0 : 0,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.grayBorder,
        height: Platform.OS === 'web' ? 70 : 60,
        zIndex: 1000, // Ensure header is above other page content
    },
    loginButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.primary, // Example primary color
        borderRadius: 5,
        marginHorizontal: 8
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: Platform.OS === 'web' ? 0.8 : 1, // Adjusted flex
        backgroundColor: 'white',
        zIndex: 10000
    },
    navLinkContainer: {
        paddingHorizontal: Platform.OS === 'web' ? 15 : 10,
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navLink: {
        fontSize: Platform.OS === 'web' ? 16 : 14,
        color: theme.colors.text,
        fontWeight: '500',
    },
    loginLink: {
        fontSize: 16,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    centerSection: {
        flex: 1.5, // Adjusted flex for more search space
        maxWidth: 400,
        justifyContent: 'flex-start',
        paddingHorizontal: Platform.OS === 'web' ? 0 : 0, // Added more padding for web
        position: 'relative', // For absolute positioning of searchResultsContainer
        backgroundColor: 'white',
    },
    searchbar: {
        borderRadius: Platform.OS === 'web' ? 25 : 5, // More rounded for web
        backgroundColor: 'white', // A slightly off-white or theme background
        // elevation: 0, // Removed for web, using border/shadow
        // marginVertical: 16, // Remove default margin
        borderWidth: 1,
        borderColor: theme.colors.grayBorder,
        alignItems: 'center',
        height: 40
        // height: 40
        // Default Paper Searchbar has its own internal padding for the icon and input
    },
    searchInputStyle: { // Style for the TextInput element *inside* the Searchbar
        paddingVertical: 0, // <-- CRITICAL: Remove default internal vertical padding
        marginVertical: 0, // Ensure no extra vertical margins
        fontSize: 14,      // Adjust font size to fit the new height
        minHeight: 0,      // Remove any default minHeight from the input field
        lineHeight: IS_WEB ? 16 : undefined, // Optional: fine-tune web text vertical position. Usually fontSize is enough with no padding.
        // The Searchbar component should handle the alignment of this input with its icon.
        // Existing margin: 0 from user is fine for horizontal.
    },
    searchResultsContainer: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 'calc(100% + 5px)' : '100%', // Position below the search bar with a small gap
        left: Platform.OS === 'web' ? 20 : 10, // Align with centerSection's padding
        right: Platform.OS === 'web' ? 20 : 10, // Align with centerSection's padding
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.grayBorder,
        borderTopWidth: Platform.OS === 'web' ? 1 : 0, // Keep top border for web for separation
        borderRadius: 0,
        padding: 10,
        maxHeight: 400, // Max height before scrolling
        zIndex: 999, // Below header's zIndex but above page content
        // Shadow for web:
        ...(Platform.OS === 'web' && {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            marginTop: 2, // Ensure shadow doesn't get cut off by searchbar
        }),
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    messageContainerSmall: {
        padding: 10,
        alignItems: 'center',
    },
    messageText: {
        marginLeft: 10,
        color: theme.colors.onSurfaceDisabled, // Or a less prominent text color
        fontSize: 14,
    },
    resultDivider: {
        marginVertical: 4,
        backgroundColor: theme.colors.outlineVariant, // Lighter divider
    },
    loadMoreWrapper: {
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outlineVariant,
    },
    loadMoreButton: {
        // You can add width or other styles if needed
    },
    loadMoreButtonLabel: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: Platform.OS === 'web' ? 0.6 : 1, // Adjusted flex
        backgroundColor: 'white',
    },
    iconButtonContainer: {
        paddingHorizontal: Platform.OS === 'web' ? 12 : 8,
        paddingVertical: 5,
    },
    iconButtonContentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    iconButtonText: {
        marginLeft: 6,
        fontSize: Platform.OS === 'web' ? 15 : 13,
        color: theme.colors.text,
        fontWeight: '500',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: theme.colors.primary,
    },
    signUpButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
        marginLeft: 10,
    },
    signUpButtonText: {
        color: theme.colors.white,
        fontWeight: 'bold',
    },
    logoutLink: {
        color: theme.colors.error,
    },
    webDrawerModalOverlay: { // For PaperModal style prop
        // Default PaperModal usually handles overlay and centering well.
        // If needed, you can force it to one side here, but contentContainerStyle is better.
    },
    webDrawerModalContent: { // For PaperModal contentContainerStyle
        backgroundColor: theme.colors.surface,
        height: '100%', // Full height
        // Width is set dynamically via prop
        position: 'absolute', // Position it like a sidebar
        right: 0,
        top: 0,
        bottom: 0,
        paddingTop: IS_WEB ? 0 : 20, // Or insets.top if not using a header inside drawer
        elevation: IS_WEB ? 16 : 0,
        borderRightWidth: IS_WEB ? 1 : 0,
        borderRightColor: theme.colors.outlineVariant,
    },
    drawerScrollView: {
        flex: 1,
        paddingLeft: 20,
    },
    chipsInsideSearchbarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: Platform.OS === 'web' ? 8 : 4, // Add some padding so chips are not flush with the edge
        // No margin needed as it's inside the searchbar's right slot
    },
    chipItemInsideSearchbar: {
        height: 28, // Make chips smaller to fit searchbar height
        // minWidth: 36, // Ensure enough width for single letter + padding
        // marginHorizontal: Platform.OS === 'web' ? 3 : 2, // Small spacing between chips
        // paddingHorizontal: 0, // Reduce padding if using single letter
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginHorizontal: 5,
        backgroundColor: theme.colors.softPrimary
        // borderWidth: 1, // For flat mode, control border explicitly
        // backgroundColor: theme.colors.surfaceVariant, // Default background for non-selected flat chip
        // borderColor: theme.colors.outline, // Default border for non-selected flat chip
    },
    chipItemSelectedInsideSearchbar: {
        backgroundColor: theme.colors.primary, // Or a more subtle selection color
        // borderColor: theme.colors.primary, // Border for selected
    },
    chipItemTextInsideSearchbar: {
        fontSize: 12, // Smaller font size
        marginHorizontal: 6, // Minimal horizontal margin for text within chip
        marginVertical: 0,
        lineHeight: 14, // Adjust for vertical centering if needed
        // color: theme.colors.onSurfaceVariant, // Default text color
    },
    chipItemTextSelectedInsideSearchbar: {
        color: theme.colors.onPrimaryContainer, // Text color for selected chip
        fontWeight: 'bold',
    },
});

export default WebHeader;