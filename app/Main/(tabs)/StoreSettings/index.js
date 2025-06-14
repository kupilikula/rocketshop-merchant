import React, {useState, useMemo} from 'react'; // Added useMemo
import { View, StyleSheet, ScrollView as DefaultScrollView, Platform, useWindowDimensions } from 'react-native'; // Added Platform, DefaultScrollView, useWindowDimensions
import { Text, List, useTheme, Divider, Button } from 'react-native-paper'; // Added Button as it's used in modals
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
// import GstRateDropdown from "../../../../components/GstRateDropdown"; // Not used in this file's JSX
import ConfirmDeactivateStoreModal from "../../../../components/ConfirmDeactivateStoreModal";
import ConfirmActivateStoreModal from "../../../../components/ConfirmActivateStoreModal";
import ConfirmDeleteStoreModal from "../../../../components/ConfirmDeleteStoreModal";
// import {getNewOfferPath, getOfferPath} from "../../../../utils/getPathUtils"; // Not used here

const IS_WEB = Platform.OS === 'web';

export default function StoreSettingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const store = useSelector((state) => state.store);
    const { width: windowWidth } = useWindowDimensions(); // For makeStyles if needed
    const styles = makeStyles(theme, IS_WEB, windowWidth); // Pass theme & IS_WEB

    const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
    const [activateModalVisible, setActivateModalVisible] = useState(false);
    const [deleteStoreModalVisible, setDeleteStoreModalVisible] = useState(false);

    // Loading/Error states for 'store' from Redux are not explicitly handled here,
    // assuming 'store' is always populated when this screen is reached.
    // If 'store' could be null/undefined initially, add checks before accessing store.isActive, etc.

    const pageContent = useMemo(() => (
        <>
            {IS_WEB && <Text variant={'titleLarge'} style={{alignSelf: 'center'}}>Store Settings</Text>}
            <List.Item
                title="Store Details"
                titleStyle={{fontSize: 20}} // Original inline style
                onPress={() => router.push(IS_WEB ? '/(web_merchant)/(protected)/store_settings/store_details' : '/Main/(tabs)/StoreSettings/EditStoreDetails')}
                style={styles.listItem} // Original style
                left={props => <List.Icon {...props} icon="store-edit-outline" />}
            />
            <Divider />
            {!store.isPlatformOwned && (
                <>
                    <List.Item
                        title="Payment Settings"
                        titleStyle={{fontSize: 20}} // Original inline style
                        onPress={() => router.push(IS_WEB ? '/(web_merchant)/(protected)/store_settings/payment_settings' : '/Main/(tabs)/StoreSettings/PaymentSettings')}
                        style={styles.listItem} // Original style
                        left={props => <List.Icon {...props} icon="credit-card-settings-outline" />}
                    />
                    <Divider />
                </>
            )}
            <List.Item
                title="Manage Merchants"
                titleStyle={{fontSize: 20}} // Original inline style
                onPress={() => router.push(IS_WEB ? '/(web_merchant)/(protected)/store_settings/merchant_management' :'/Main/(tabs)/StoreSettings/MerchantManagement')}
                style={styles.listItem} // Original style
                left={props => <List.Icon {...props} icon="account-group-outline" />}
            />
            <Divider />
            <List.Item
                title="GST Settings"
                titleStyle={styles.sectionTitle} // Original style
                style={styles.listItem} // Original style
                onPress={() => router.push(IS_WEB ? '/(web_merchant)/(protected)/store_settings/gst_settings' : '/Main/(tabs)/StoreSettings/GstSettings')}
                left={props => <List.Icon {...props} icon="receipt" />}
            />
            <Divider />
            <List.Item
                title="Store Policy"
                titleStyle={styles.sectionTitle} // Original style
                style={styles.listItem} // Original style
                onPress={() => router.push(IS_WEB ? '/(web_merchant)/(protected)/store_settings/store_policy' : '/Main/(tabs)/StoreSettings/StorePolicy')}
                left={props => <List.Icon {...props} icon="gavel" />}
            />
            <Divider />
            { store.isActive ? (
                <List.Item
                    title="Deactivate Store"
                    titleStyle={{fontSize: 20}} // Original inline style
                    onPress={() => setDeactivateModalVisible(true)}
                    style={styles.listItem} // Original style
                    left={props => <List.Icon {...props} icon="store-remove-outline" color={theme.colors.error} />}
                />
            ) : (
                <List.Item
                    title="Activate Store"
                    titleStyle={{fontSize: 20}} // Original inline style
                    onPress={() => setActivateModalVisible(true)}
                    style={styles.listItem} // Original style
                    left={props => <List.Icon {...props} icon="store-plus-outline" color={theme.colors.success}/>}
                />
            )}
            <Divider />
            { !store.isActive && (
                <List.Item
                    title="Delete Store"
                    titleStyle={{ color: theme.colors.error, fontSize: 20}} // Original inline style
                    onPress={() => setDeleteStoreModalVisible(true)}
                    style={styles.listItem} // Original style
                    left={props => <List.Icon {...props} icon="delete-forever-outline" color={theme.colors.error}/>}
                />
            )}
        </>
    ), [store, router, styles, theme, setDeactivateModalVisible, setActivateModalVisible, setDeleteStoreModalVisible]); // Stable dependencies


    // The main return structure which is a fragment
    return (
        <>
            {IS_WEB ? (
                <View style={styles.webPageContainer_Root}>
                    <DefaultScrollView
                        style={styles.webScrollView_Shell}
                        contentContainerStyle={styles.webScrollViewContentContainer_Shell}
                        // keyboardShouldPersistTaps="handled" // Not many inputs here, but good for consistency
                    >
                        {pageContent}
                    </DefaultScrollView>
                </View>
            ) : (
                // Original mobile root structure
                <DefaultScrollView
                    style={{backgroundColor: 'white'}} // Original inline style for ScrollView
                    contentContainerStyle={styles.container} // Original contentContainerStyle
                    // keyboardShouldPersistTaps="handled" // If needed
                >
                    {pageContent}
                </DefaultScrollView>
            )}

            {/* Modals are kept at this root fragment level. */}
            {/* They are passed a conditional style for web width constraint. */}
            {/* ASSUMPTION: Your custom modal components can accept and apply `modalStyle`
                           to their Paper.Modal's `contentContainerStyle` or Paper.Dialog's `style`. */}
            {store.isActive && (
                <ConfirmDeactivateStoreModal
                    visible={deactivateModalVisible}
                    onDismiss={() => setDeactivateModalVisible(false)}
                    storeId={store.storeId}
                    storeName={store.storeName}
                    modalStyle={IS_WEB ? styles.webModalStyle : {}}
                />
            )}
            {!store.isActive && ( // Grouped these two as they both depend on !store.isActive
                <>
                    <ConfirmActivateStoreModal
                        visible={activateModalVisible}
                        onDismiss={() => setActivateModalVisible(false)}
                        storeId={store.storeId}
                        storeName={store.storeName}
                        modalStyle={IS_WEB ? styles.webModalStyle : {}}
                    />
                    <ConfirmDeleteStoreModal
                        visible={deleteStoreModalVisible}
                        onDismiss={() => setDeleteStoreModalVisible(false)}
                        storeId={store.storeId}
                        storeName={store.storeName}
                        modalStyle={IS_WEB ? styles.webModalStyle : {}}
                    />
                </>
            )}
        </>
    );
}

const makeStyles = (theme, isWeb, windowWidth) => { // Added isWeb, windowWidth
    // const { colors } = theme; // Original used theme.colors directly
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container: { // For ScrollView contentContainerStyle on MOBILE
            padding: 16,
            backgroundColor: 'white', // Original
            flexGrow: 1,          // Original
        },
        listItem: { // Original style
            paddingVertical: 12,
            // backgroundColor: 'white', // List.Item is transparent, bg from container
        },
        sectionTitle: { // Original style (used in List.Item titleStyle for GST Settings)
            // marginBottom: 0, // Original
            fontSize: 20,
            // color: theme.colors.onSurface, // Ensuring it uses theme color explicitly
        },

        // --- New Web Layout Container Styles ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center', // Centers the shell
        },
        webScrollView_Shell: { // The ScrollView component itself on web
            width: '100%',
            maxWidth: 768, // Max width for a settings list screen
            flex: 1,
            backgroundColor: 'white', // Matches mobile ScrollView style
        },
        webScrollViewContentContainer_Shell: { // contentContainerStyle for the web ScrollView
            padding: 16,        // Matches mobile styles.container.padding
            backgroundColor: 'white', // Matches mobile styles.container.backgroundColor
            flexGrow: 1,          // Matches mobile styles.container.flexGrow
        },
        // --- Web Modal Style ---
        webModalStyle: { // This style is passed to your custom modal components
            maxWidth: 500,      // Constrained width for modals on web
            width: IS_WEB ? '90%' : undefined,  // Responsive width up to maxWidth, only on web
            alignSelf: 'center', // If the modal component (Paper.Dialog or Paper.Modal) doesn't self-center
        },
    });
};

