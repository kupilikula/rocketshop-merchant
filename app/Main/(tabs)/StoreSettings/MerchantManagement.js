import React, { useState, useMemo } from "react";
import {
    View,
    StyleSheet,
    ScrollView as DefaultScrollView, // Renamed for clarity
    Alert,
    Switch,
    Platform, // Added
    useWindowDimensions, // Added
    ActivityIndicator // Added
} from "react-native";
import {
    Text,
    Card,
    Button,
    IconButton,
    Menu,
    useTheme,
    Chip,
    TextInput,
    Portal,
    Modal, // This is Paper.Modal
    RadioButton
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getAxiosClient } from "../../../../api/client";
import PhoneInput from "../../../../components/PhoneInput"; // Assuming path is correct
import KeyboardAwareScrollableScreen from "../../../../components/KeyboardAwareScrollableScreen"; // For mobile modal
import {useSafeAreaInsets} from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {useSelector} from "react-redux"; // For error icon

const IS_WEB = Platform.OS === 'web';

export default function MerchantManagementScreen() {
    const theme = useTheme();
    const router = useRouter(); // Retained
    const axiosClient = getAxiosClient();
    const {storeId, merchantRole: currentMerchantRole} = useSelector((state) => state.store);
    const queryClient = useQueryClient();
    const {merchantId: currentMerchantId} = useSelector((state) => state.merchant);
    const { width: windowWidth } = useWindowDimensions();
    const insets = useSafeAreaInsets(); // Used for KAV in modal
    const styles = makeStyles(theme, IS_WEB, windowWidth, insets); // Pass all needed to makeStyles

    const [menuOpenFor, setMenuOpenFor] = useState(null);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [newFullName, setNewFullName]  = useState('');
    const [newMerchantRole, setNewMerchantRole]  = useState('Staff');
    const [newCanReceiveMessages, setNewCanReceiveMessages] = useState(false); // Default to false as per original Add button

    const { data: merchants = [], isLoading, isError } = useQuery({
        queryKey: ["storeMerchants", storeId],
        queryFn: async () => {
            const res = await axiosClient.get(`/stores/${storeId}/getMerchants`);
            return res.data.merchants;
        },
        enabled: !!storeId,
    });

    const addMerchantMutation = useMutation(
        (newMerchantData) => axiosClient.post(`/stores/${storeId}/addMerchantToStore`, newMerchantData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["storeMerchants", storeId]);
                setAddModalVisible(false);
                setNewPhone('');
                setNewFullName('');
                setNewMerchantRole('Staff');
                setNewCanReceiveMessages(false); // Reset to default
            },
            onError: (error) => {
                Alert.alert('Error', error.response?.data?.message || 'Failed to add merchant.');
            }
        }
    );

    const updateMerchantRoleMutation = useMutation(
        ({ merchantIdToUpdate, newRole }) => axiosClient.patch(`/stores/${storeId}/updateMerchantRole/${merchantIdToUpdate}`, { newMerchantRole: newRole }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["storeMerchants", storeId]);
                setMenuOpenFor(null);
            },
            onError: (error) => Alert.alert('Error', 'Failed to change role.')
        }
    );

    const toggleMessagesMutation = useMutation(
        ({ merchantIdToToggle, canReceive }) => axiosClient.patch(`/stores/${storeId}/updateMerchantCanReceiveMessages/${merchantIdToToggle}`, { canReceiveMessages: canReceive }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["storeMerchants", storeId]);
                setMenuOpenFor(null);
            },
            onError: (error) => Alert.alert('Error', 'Failed to update message preference.')
        }
    );

    const removeMerchantMutation = useMutation(
        (merchantIdToRemove) => axiosClient.delete(`/stores/${storeId}/removeMerchantFromStore/${merchantIdToRemove}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["storeMerchants", storeId]);
                setMenuOpenFor(null);
            },
            onError: (error) => Alert.alert('Error', 'Failed to remove merchant.')
        }
    );


    const handleAddMerchant = () => { // Renamed from original inline to avoid conflict
        if (!newPhone || !newFullName || !newMerchantRole) {
            Alert.alert('Validation Error', 'Phone, Full Name, and Role are required.');
            return;
        }
        addMerchantMutation.mutate({
            phone: newPhone,
            fullName: newFullName,
            merchantRole: newMerchantRole,
            canReceiveMessages: newCanReceiveMessages,
        });
    };

    const handleToggleReceiveMessages = (merchantIdToToggle, currentValue) => {
        toggleMessagesMutation.mutate({ merchantIdToToggle, canReceive: !currentValue });
    };

    const handleRemoveMerchant = (merchantIdToRemove) => {
        Alert.alert(
            "Remove Merchant",
            "Are you sure you want to remove this merchant from the store?",
            [
                { text: "Cancel", style: "cancel", onPress: () => setMenuOpenFor(null) },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => removeMerchantMutation.mutate(merchantIdToRemove),
                },
            ]
        );
    };

    const handleChangeRole = (merchantIdToUpdate, newRole) => {
        updateMerchantRoleMutation.mutate({ merchantIdToUpdate, newRole });
    };

    console.log('menuOpenFor:', menuOpenFor); // Original console.log
    console.log('currentMerchantRole:', currentMerchantRole); // Original console.log

    const pageContent = useMemo(() => (
        <>
            {(merchants || []).map((merchant) => (
                <Card key={merchant.merchantId} style={styles.card}>
                    <View style={styles.cardContent}>
                        <View style={{flex: 1, marginRight: 8}}> {/* Allow text content to take space and wrap */}
                            <Text variant="titleMedium">{merchant.fullName}</Text>
                            <Text variant="bodyMedium">{merchant.phone}</Text>
                            <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                                <Chip>{merchant.merchantRole}</Chip>
                                {merchant.merchantId === currentMerchantId && (
                                    <Chip mode="flat" style={{ backgroundColor: theme.colors.primary }}>
                                        You
                                    </Chip>
                                )}
                                <Chip
                                    icon={merchant.canReceiveMessages ? "message" : "message-off"}
                                    style={{
                                        backgroundColor: merchant.canReceiveMessages
                                            ? theme.colors.secondaryContainer
                                            : theme.colors.errorContainer,
                                    }}
                                >
                                    {merchant.canReceiveMessages ? "Messages On" : "Messages Off"}
                                </Chip>
                            </View>
                        </View>

                        {merchant.merchantId !== currentMerchantId && (
                            <Menu
                                contentStyle={{ backgroundColor: 'white' }} // Original style
                                visible={menuOpenFor === merchant.merchantId}
                                onDismiss={() => setMenuOpenFor(null)}
                                anchor={
                                    <IconButton
                                        icon="dots-vertical"
                                        onPress={() =>
                                            setMenuOpenFor(
                                                menuOpenFor === merchant.merchantId ? null : merchant.merchantId
                                            )
                                        }
                                    />
                                }
                            >
                                {currentMerchantRole === 'Admin' &&
                                    ["Admin", "Manager", "Staff"]
                                        .filter((role) => role !== merchant.merchantRole)
                                        .map((role) => (
                                            <Menu.Item
                                                key={role}
                                                onPress={() => handleChangeRole(merchant.merchantId, role)}
                                                title={`Make ${role}`}
                                                style={{ backgroundColor: 'white' }} // Original style
                                            />
                                        ))}
                                {currentMerchantRole === 'Manager' && merchant.merchantRole === 'Staff' && (
                                    <Menu.Item
                                        onPress={() => handleChangeRole(merchant.merchantId, 'Manager')}
                                        title="Make Manager"
                                        style={{ backgroundColor: 'white' }} // Original style
                                    />
                                )}
                                {(currentMerchantRole === 'Admin' || (currentMerchantRole === 'Manager' && merchant.merchantRole === 'Staff')) && (
                                    <Menu.Item
                                        onPress={() => handleToggleReceiveMessages(merchant.merchantId, merchant.canReceiveMessages)}
                                        title={merchant.canReceiveMessages ? "Disable Messages" : "Enable Messages"}
                                        style={{ backgroundColor: 'white' }} // Original style
                                    />
                                )}
                                {(currentMerchantRole === 'Admin' || (currentMerchantRole === 'Manager' && merchant.merchantRole === 'Staff')) && (
                                    <Menu.Item
                                        onPress={() => handleRemoveMerchant(merchant.merchantId)}
                                        title="Remove Merchant"
                                        style={{ backgroundColor: 'white' }} // Original style
                                    />
                                )}
                            </Menu>
                        )}
                    </View>
                </Card>
            ))}
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingVertical: 16 /* Add padding for button */}}>
                <Button
                    icon={'plus'}
                    mode="contained"
                    onPress={() => setAddModalVisible(true)}
                    style={{ marginTop: 24, borderRadius: 8, minWidth: 200 }} // Give button a minWidth
                    labelStyle={{fontSize: 16}}
                >
                    Add New Merchant
                </Button>
            </View>
        </>
    ), [merchants, menuOpenFor, currentMerchantRole, currentMerchantId, theme, styles, handleRemoveMerchant, handleChangeRole, handleToggleReceiveMessages]);


    const loadingErrorContent = (message, isErrorState = false) => (
        <View style={IS_WEB ? styles.centeredWebMessageContent : styles.mobileCenteredFullScreen}>
            {isErrorState && <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} style={{ marginBottom: 10 }} />}
            {!isErrorState && <ActivityIndicator size={IS_WEB ? "large" : 100} color={theme.colors.primary} style={{ marginBottom: 10 }} />}
            <Text variant={isErrorState ? "titleMedium" : "bodyLarge"}>{message}</Text>
        </View>
    );

    if (isLoading) {
        const loadingView = loadingErrorContent("Loading merchants...");
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webMaxContentContainer_Shell}>{loadingView}</View></View>
            : loadingView;
    }

    if (isError) {
        const errorView = loadingErrorContent("Error loading merchants.", true);
        return IS_WEB
            ? <View style={styles.webPageContainer_Root}><View style={styles.webMaxContentContainer_Shell}>{errorView}</View></View>
            : errorView;
    }

    const addMerchantModalContent = (
        <>
            <Text variant="titleMedium" style={{ marginBottom: 16, textAlign: 'center' }}>
                Add New Merchant
            </Text>
            <PhoneInput setPhone={setNewPhone} defaultCountryCode="IN" />
            <TextInput
                label="Full Name"
                value={newFullName} // Controlled component
                mode="outlined"
                onChangeText={setNewFullName}
                style={{ marginTop: 16, marginBottom: 16, backgroundColor: 'white' }} // Added marginTop
            />
            <Text variant="titleSmall" style={{ marginBottom: 8 }}>Role</Text>
            <RadioButton.Group onValueChange={setNewMerchantRole} value={newMerchantRole}>
                <View style={{ flexDirection: IS_WEB ? 'row' : 'column', flexWrap: 'wrap', alignItems: 'flex-start', gap: IS_WEB ? 16 : 0 }}>
                    {["Admin", "Manager", "Staff"]
                        .filter((role) => {
                            if (currentMerchantRole === 'Admin') return true;
                            if (currentMerchantRole === 'Manager') return role !== 'Admin';
                            return false;
                        })
                        .map((role) => (
                            <View key={role} style={{ flexDirection: 'row', alignItems: 'center', marginRight: IS_WEB ? 20 : 0 }}>
                                <RadioButton.Android value={role} color={theme.colors.primary}/>
                                <Text>{role}</Text>
                            </View>
                        ))}
                </View>
            </RadioButton.Group>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 16}}>
                <Text variant="titleSmall">Enable Message Notifications</Text>
                <Switch value={newCanReceiveMessages} onValueChange={setNewCanReceiveMessages} color={theme.colors.primary} />
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 24 }}>
                <Button mode="outlined" onPress={() => setAddModalVisible(false)} style={{borderRadius: 8, minWidth: 120}}>Cancel</Button>
                <Button mode="contained" onPress={handleAddMerchant} style={{borderRadius: 8, minWidth: 120}} loading={addMerchantMutation.isLoading} disabled={addMerchantMutation.isLoading}>Add</Button>
            </View>
        </>
    );


    return (
        <>
            {IS_WEB ? (
                <View style={styles.webPageContainer_Root}>
                    <DefaultScrollView
                        style={styles.webScrollView_Shell}
                        contentContainerStyle={styles.webScrollViewContentContainer_Shell}
                        keyboardShouldPersistTaps="handled"
                    >
                        {pageContent}
                    </DefaultScrollView>
                </View>
            ) : (
                // Original mobile root: ScrollView directly, styled by styles.container
                <DefaultScrollView
                    style={{backgroundColor: 'white'}} // Original ScrollView style
                    contentContainerStyle={styles.container} // Original contentContainerStyle
                    keyboardShouldPersistTaps="handled"
                >
                    {pageContent}
                </DefaultScrollView>
            )}
            <Portal>
                <Modal
                    visible={addModalVisible}
                    onDismiss={() => setAddModalVisible(false)}
                    contentContainerStyle={styles.modalContent} // This style will be made platform-aware
                >
                    {IS_WEB ? (
                        <DefaultScrollView style={styles.modalScrollViewWeb} contentContainerStyle={styles.modalScrollViewContentWeb}>
                            {addMerchantModalContent}
                        </DefaultScrollView>
                    ) : (
                        <KeyboardAwareScrollableScreen
                            keyboardVerticalOffset={insets.top > 0 ? insets.top : 60} // Adjust offset
                            extraScrollHeight={Platform.OS === 'ios' ? 20 : 0} // Optional extra scroll for iOS
                            enableOnAndroid={true} // Ensure it's enabled on Android
                            // containerStyle={{flexGrow: 1}} // KAV's internal ScrollView can grow
                            // innerStyle={{padding:16}} // If content needs padding inside KAV ScrollView
                        >
                            {addMerchantModalContent}
                        </KeyboardAwareScrollableScreen>
                    )}
                </Modal>
            </Portal>
        </>
    );
}

const makeStyles = (theme, isWeb, windowWidth, insets) => { // Added insets
    const { colors } = theme;
    return StyleSheet.create({
        // --- Original Mobile Styles (MUST BE PRESERVED EXACTLY) ---
        container: { // For mobile ScrollView contentContainerStyle (main list)
            padding: 16,
            backgroundColor: 'white', // Original
            // flexGrow: 1, // Original did not have this, add if needed for short lists to fill view
        },
        card: { // Original style for merchant item cards
            padding: 12,
            marginBottom: 12,
            backgroundColor: 'white', // Original
            borderRadius: 8, // Added for consistency with other cards
            elevation: 1, // Subtle elevation
        },
        cardContent: { // Original style
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        modalContent: { // For Paper.Modal's contentContainerStyle (Add Merchant Modal)
            backgroundColor: 'white',
            padding: 20, // Increased padding
            marginHorizontal: IS_WEB ? 'auto' : 16, // Centered margin for web, original for mobile
            marginVertical: IS_WEB ? 20 : 16, // Vertical margin
            borderRadius: IS_WEB ? 12 : 8, // More rounded for web
            elevation: 5,
            // Web-specific width & height constraints
            ...(IS_WEB && {
                maxWidth: 550,
                width: '90%',
                maxHeight: '90vh', // Max height for the modal box itself
                display: 'flex',    // Ensure it's a flex container for internal scrollview
                flexDirection: 'column',
            })
        },
        // Styles for internal ScrollView within modal on WEB
        modalScrollViewWeb: {
            flex: 1, // Takes available space within modalContent's maxHeight
            width: '100%',
        },
        modalScrollViewContentWeb: {
            paddingBottom: 20, // Ensure scrollable content has bottom padding
            flexGrow: 1, // Allow content to grow
        },

        // --- New Web Layout Container Styles (for main list) ---
        webPageContainer_Root: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
        },
        webScrollView_Shell: {
            width: '100%',
            maxWidth: 768,
            flex: 1,
            backgroundColor: 'white',
        },
        webScrollViewContentContainer_Shell: {
            padding: 16,
            backgroundColor: 'white',
            flexGrow: 1,
        },

        // --- Common Centered Styles (for loading/error on main list) ---
        mobileCenteredFullScreen: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.surface, // Original background
            padding: 20,
        },
        centeredWebMessageContent: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: 20,
        },
        // Copied from Products.js for Accordion, ensure these match if they were intended to be identical
        accordionBar: { backgroundColor: colors.softPrimary, height: 50, minHeight: 50, justifyContent: "center", alignItems: "center", borderRadius: 0, borderBottomWidth:1, borderColor: colors.outlineVariant},
        accordionContent: { justifyContent: "center", backgroundColor: colors.white, paddingBottom: 8 },
        accordionTitle: { color: "black", fontSize: 16, fontWeight: "bold" },
    });
};

