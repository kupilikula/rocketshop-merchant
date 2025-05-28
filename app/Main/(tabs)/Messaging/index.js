import React, { useMemo } from 'react';
import {FlatList, View, StyleSheet, Platform, useWindowDimensions, ActivityIndicator} from 'react-native';
import {List, Text, useTheme, Divider, Badge, Card} from 'react-native-paper'; // Added Card for web layout
import { useRouter, usePathname } from 'expo-router'; // Added usePathname
import { useSelector } from 'react-redux';
import { useChats } from "../../../../api/hooks/useChats";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {getChatPath} from "../../../../utils/getPathUtils"; // For empty/error states

const IS_WEB = Platform.OS === 'web';

const ChatListScreen = () => {
    const {storeId} = useSelector( (state) => state.store);
    const { data: chatsResponse, isLoading, isError } = useChats(storeId); // Renamed for clarity
    const chats = useMemo(() => chatsResponse || [], [chatsResponse]); // Ensure chats is always an array

    const router = useRouter();
    const theme = useTheme();
    const {unreadMessages} = useSelector((state)=> state.badges);
    const currentPath = usePathname(); // For potential backHref if needed by chat screen
    const { width: windowWidth } = useWindowDimensions();
    const insets = useSafeAreaInsets(); // For potential safe area use in styles
    const styles = useMemo(() => makeStyles(theme, IS_WEB, windowWidth, insets), [theme, IS_WEB, windowWidth, insets]);


    const handleChatPress = (chatId, customerId, customerName, customerPhone) => { // Kept original params
        router.push({
            pathname: getChatPath(), // Original path
            params: { chatId, customerId, customerName, customerPhone, backHref: currentPath } // Added backHref
        });
    };

    const renderChatListItem = ({ item }) => ( // Renamed for clarity
        <>
            <Divider style={styles.divider_platform} />
            <List.Item
                style={styles.listItem_platform} // Using style from makeStyles
                title={item.customerName + ' (' + item.customerPhone +')'}
                titleStyle={styles.listItemTitle_platform} // Using style from makeStyles
                description={item.lastMessage}
                descriptionStyle={styles.listItemDescription_platform} // Using style from makeStyles
                descriptionNumberOfLines={1}
                // No left icon in original merchant app
                right={() =>
                    unreadMessages && unreadMessages[item.chatId]?.length > 0 ? (
                        <Badge style={styles.badge_platform}>{unreadMessages[item.chatId]?.length}</Badge>
                    ) : null
                }
                onPress={() => handleChatPress(item.chatId, item.customerId, item.customerName, item.customerPhone)}
            />
            <Divider style={styles.divider_platform} />
        </>
    );

    const renderChatListPageContent = () => {
        if (isLoading) {
            return (
                <View style={styles.centeredMessageContainer_platform}>
                    <ActivityIndicator animating={true} size={IS_WEB ? "large" : 100} color={theme.colors.primary}/>
                    <Text style={{marginTop: 10}}>Loading Chats...</Text>
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.centeredMessageContainer_platform}>
                    <MaterialCommunityIcons name="chat-alert-outline" size={IS_WEB ? 60: 48} color={theme.colors.error} />
                    <Text variant="titleMedium" style={styles.emptyListText_platform}>Error Loading Chats</Text>
                </View>
            );
        }

        if (!chats || chats.length === 0) {
            return (
                <View style={styles.centeredMessageContainer_platform}>
                    <MaterialCommunityIcons name="chat-remove-outline" size={IS_WEB ? 60: 48} color={theme.colors.onSurfaceDisabled} />
                    <Text variant="titleMedium" style={styles.emptyListText_platform}>
                        You don't have any open messages.
                    </Text>
                </View>
            );
        }

        return (
            // This View is styled by listContainer_platform.
            // On Mobile, it serves as the root. On Web, it's inside the Card.
            <View style={styles.listContainer_platform}>
                {IS_WEB && <Text variant="headlineSmall" style={styles.webListHeader}>Messages</Text>}
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.chatId.toString()}
                    renderItem={renderChatListItem}
                    // ItemSeparatorComponent not needed due to Divider in renderChatListItem's fragment
                    contentContainerStyle={styles.flatListContentContainer_platform}
                />
            </View>
        );
    };

    const pageContentToRender = renderChatListPageContent();

    if (IS_WEB) {
        return (
            <View style={styles.webPageContainer}>
                <Card style={styles.webMaxContentWidthWrapper}>
                    {pageContentToRender}
                </Card>
            </View>
        );
    } else { // Mobile
        // For mobile, pageContentToRender returns the View styled by listContainer_platform,
        // which has flex:1 and the correct background, effectively acting as the root.
        return pageContentToRender;
    }
};

const makeStyles = (theme, isWeb, windowWidth, insets) => StyleSheet.create({
    // --- Web Page Structure ---
    webPageContainer: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: isWeb ? 20 : 0, // Overall page padding for web
        paddingBottom: isWeb ? 20 : 0,
    },
    webMaxContentWidthWrapper: { // The Card containing the list on web
        flex: 1,
        width: '100%',
        maxWidth: 768,
        backgroundColor: theme.colors.surface,
        borderRadius: isWeb ? 12 : 0, // Rounded corners for web card
        overflow: isWeb ? 'hidden' : undefined,
        elevation: isWeb ? 3 : 0, // Elevation for web card
    },
    webListHeader: { // Specific for the "Messages" title on web
        padding: 16,
        paddingBottom: 8, // Less bottom padding as list follows
        textAlign:'center',
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },

    // --- Platform-aware container for the list or messages ---
    listContainer_platform: { // Root for mobile, content container for web (inside Card)
        flex: 1,
        backgroundColor: theme.colors.surface, // Original mobile root background
        // Original mobile root had padding: 0, list items/content handle their own
    },
    centeredMessageContainer_platform: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyListText_platform: {
        textAlign: 'center',
        marginTop: 20,
        color: theme.colors.onSurfaceDisabled,
    },

    // --- Styles for FlatList and its items ---
    flatListContentContainer_platform: {
        marginVertical: isWeb ? 0 : 16, // Original mobile marginVertical
        minHeight: '100%', // Original
        paddingHorizontal: isWeb ? 10 : 0, // Add some horizontal padding for list items on web
        flexGrow: 1,
    },
    listItem_platform: { // Based on original mobile inline style for List.Item
        paddingHorizontal: isWeb? 8 : 0, // Mobile had padding:0, web gets some for content within card
        backgroundColor: 'white',
        height: 80,
        justifyContent: 'center', // Vertically centers content within the 80px height
        // alignContent: 'center', // Not a valid RN style, justifyContent handles vertical centering for fixed height
    },
    listItemTitle_platform: { // From original List.Item titleStyle
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        fontSize: 16, // Consistent font size
    },
    listItemDescription_platform: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 14,
    },
    badge_platform: {
        alignSelf: 'center',
        backgroundColor: theme.colors.primary,
        color: theme.colors.onPrimary, // Text color for badge content
        marginRight: isWeb ? 16 : 8, // Ensure badge is not at the very edge
    },
    divider_platform: { // From original inline style inside renderItem
        marginVertical: 1,
        height: 1, // Ensure divider is visible
        backgroundColor: theme.colors.outlineVariant, // Use a subtle theme color
        // If mobile items have no horizontal padding, divider might be full width.
        // On web, if items get padding, divider can also be full width of item or indented.
        marginHorizontal: isWeb ? 0 : 0, // Original mobile was effectively full width
    },
});

export default ChatListScreen;