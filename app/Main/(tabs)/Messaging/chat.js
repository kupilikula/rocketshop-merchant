import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Keyboard,
    ScrollView,
    View,
    StyleSheet,
    Platform,
    TouchableWithoutFeedback, FlatList, Pressable,
} from 'react-native';
import {Button, ActivityIndicator, Card, Text, useTheme, TextInput, Snackbar} from 'react-native-paper';
import { useQuery, useQueryClient } from 'react-query';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import {useDispatch, useSelector} from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axiosClient from "../../../../api/client";
import { getSocket } from "../../../../api/websocket";
import KeyboardSpacer from "../../../../components/KeyboardSpacer";
import GenericHeader from "../../../../components/GenericHeader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import {v4 as uuidv4} from 'uuid';
import {removeUnreadMessages} from "../../../../store/badgesSlice";
import {copyContent} from "../../../../utils/copyToClipboard";

const fetchChatMessages = async (chatId) => {
    const response = await axiosClient.get(`/chats/${chatId}/messages`);
    return response.data;
};

const ChatScreen = () => {
    const { chatId, customerId, customerName } = useLocalSearchParams();
    console.log('customerName:', customerName, ' , customerId:', customerId);
    const { merchantId } = useSelector((state) => state.merchant);
    const queryClient = useQueryClient();
    const router = useRouter();
    const socket = getSocket();
    const dispatch = useDispatch();
    const flatListRef = useRef();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [otherUserIsTyping, setOtherUserIsTyping] = useState(false); // Tracks if the other user is typing
    const typingDebounceRef = useRef(null); // Debounce timer for `typing` event
    const stopTypingTimeoutRef = useRef(null); // Timeout for `stopTyping` event

    const { data: messages, isLoading } = useQuery(['messages', chatId], () => fetchChatMessages(chatId));

    const [message, setMessage] = useState('');
    const [isSnackbarVisible, setSnackbarVisible] = useState(false);

    useEffect(() => {
        if (!chatId) {
            router.replace('/Main/(tabs)/Messaging');
        }
    }, [chatId]);

    useEffect(() => {
        navigation.setOptions({
            header: () => <GenericHeader title={customerName} right={<Pressable
                style={{width: 60, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}
                onPress={() => router.push(`/Main/(tabs)/Customers/Customer/${customerId}`)}
            >
                <MaterialIcons name={'person'} size={36}/>
            </Pressable>}/>,
        });
    }, [customerName]);

    const scrollToEnd = () => {
        let delay = Platform.OS === 'android' ? 500 : 200;
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, delay);
    };

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            chatId,
            senderId: merchantId,
            senderType: 'Merchant',
            message,
            messageId: uuidv4(),
            created_at: new Date(),
        };
        socket.emit('stopTyping', { chatId, senderId: merchantId }); // Stop typing when a message is sent
        socket.emit('sendMessage', newMessage);

        queryClient.setQueryData(['messages', chatId], (oldMessages) => [
            ...(oldMessages || []),
            newMessage,
        ]);

        setMessage('');
    };


    const handleTyping = (text) => {
        setMessage(text);

        // Clear the existing `stopTyping` timeout if user types again
        clearTimeout(stopTypingTimeoutRef.current);

        // Debounce `typing` event to reduce the frequency of emissions
        if (!typingDebounceRef.current) {
            socket.emit('typing', { chatId, senderId: merchantId }); // Emit `typing` event
            typingDebounceRef.current = setTimeout(() => {
                typingDebounceRef.current = null; // Reset debounce
            }, 1000); // Emit `typing` event every 1 second max while typing
        }

        // Set a timeout to emit `stopTyping` when user stops typing
        stopTypingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { chatId, senderId: merchantId }); // Emit `stopTyping` event
            stopTypingTimeoutRef.current = null; // Clear the timeout
        }, 1000); // Emit `stopTyping` after 1 second of inactivity
    };

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', scrollToEnd);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', scrollToEnd);

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        const joinRoom = () => {
            console.log('Reconnected. Rejoining chat room...');
            socket.emit('joinChat', { chatId, userId: merchantId, userType: 'Customer' });
        };

        // Emit `joinChat` when the connection is established or re-established
        socket.on('connect', joinRoom);

        socket.emit('joinChat', { chatId, userId: merchantId, userType: 'Merchant' });

        const handleReceiveMessage = (newMessage) => {
            console.log('new message received in merchant app from customer app:', newMessage);
            queryClient.setQueryData(['messages', chatId], (oldMessages) => [
                ...(oldMessages || []),
                newMessage,
            ]);
        };

        socket.on('receiveMessage', handleReceiveMessage);

        const handleMessageRead = ({ messageId }) => {
            console.log('handleMessageRead, messageId:', messageId);
            queryClient.setQueryData(['messages', chatId], (oldMessages) => {

                console.log('oldM:',oldMessages);
            return    oldMessages.map((message) =>
                    message.messageId === messageId ? { ...message, read_at: new Date() } : message
                )
            }
            );
        };

        socket.on('messageRead', handleMessageRead);

        const handleTypingIndicator = ({ senderId }) => {
            if (senderId !== merchantId) setOtherUserIsTyping(true); // Show typing indicator
        };

        const handleStopTypingIndicator = ({ senderId }) => {
            if (senderId !== merchantId) setOtherUserIsTyping(false); // Hide typing indicator
        };
        socket.on('typing', handleTypingIndicator);
        socket.on('stopTyping', handleStopTypingIndicator);

        return () => {
            socket.off('connect', joinRoom); // Cleanup the `connect` listener
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('messageRead', handleMessageRead);
            socket.off('typing', handleTypingIndicator);
            socket.off('stopTyping', handleStopTypingIndicator);
            socket.emit('leaveChat', { chatId, userId: merchantId });
        };
    }, [chatId, merchantId]);

    // Helper to format timestamps
    const formatTimestamp = (date) => format(new Date(date), 'hh:mm a');

// Helper to group messages by day
    const groupMessagesByDay = (messages) => {
        const groupedMessages = [];
        let lastDay = null;

        messages.forEach((message) => {
            const messageDay = format(new Date(message.created_at), 'yyyy-MM-dd');

            if (messageDay !== lastDay) {
                lastDay = messageDay;

                const dayLabel = isToday(new Date(message.created_at))
                    ? 'Today'
                    : isYesterday(new Date(message.created_at))
                        ? 'Yesterday'
                        : format(new Date(message.created_at), 'dd MMMM, yyyy');

                // Add a marker for the day
                groupedMessages.push({ type: 'dayMarker', dayLabel });
            }

            // Add the message
            groupedMessages.push({ type: 'message', ...message });
        });
        groupedMessages.push({type: 'typingIndicator'});
        return groupedMessages;
    };

    const groupedMessages = groupMessagesByDay(messages || []);

    const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
        // console.log('m:', viewableItems.map((it)=>it.item));
        // Filter out messages that are already marked as read
        const newReadMessageIds = viewableItems
            .map((item) => item.item)
            .filter( (item) => item.type==='message')
            .filter((message) => message.senderId!==merchantId && !message.read_at) // Check if `read_at` is null
            .map((message) => message.messageId); // Extract message IDs

        if (newReadMessageIds.length > 0) {
            // Mark messages as read in the database
            axiosClient.post(`/chats/${chatId}/messages/read`, { messageIds: newReadMessageIds });

            // Emit read receipts via WebSocket
            newReadMessageIds.forEach((messageId) => {
                socket.emit('messageRead', {
                    chatId,
                    messageId,
                    readerId: merchantId, // or merchantId, depending on the app
                });
            });

            dispatch(removeUnreadMessages({chatId, messageIds: newReadMessageIds}));

            // Optimistically update the local cache to set `read_at` for these messages
            queryClient.setQueryData(['messages', chatId], (oldMessages) =>
                oldMessages.map((message) =>
                    newReadMessageIds.includes(message.messageId)
                        ? { ...message, read_at: new Date().toISOString() } // Set `read_at` timestamp
                        : message
                )
            );
        }
    }, [chatId, socket, merchantId, queryClient]);


    if (isLoading) {
        return <ActivityIndicator animating={true} size="large" style={{ flex: 1 }} />;
    }

    return (
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={groupedMessages} // Use the messages array as the data source
                    contentContainerStyle={{
                        paddingBottom: 16,
                        width: '100%',
                        flexGrow: 1, // Ensure content takes up full available height
                        justifyContent: 'flex-end', // Align messages to the bottom
                    }}
                    keyExtractor={(item, index) => `${item.type}-${index}`} // Provide a unique key for each message
                    onViewableItemsChanged={handleViewableItemsChanged}
                    viewabilityConfig={{ itemVisiblePercentThreshold: 80 }} // Detect when 80% of the item is visible
                    renderItem={({ item }) => {
                        if (item.type==='typingIndicator') {
                            return otherUserIsTyping ?
                                <View
                                    style={{
                                        ...styles.typingIndicator,
                                        alignSelf: isMyMessage ? "flex-end" : "flex-start",
                                        backgroundColor: isMyMessage ? theme.colors.primary : theme.colors.secondary,

                                    }}
                                >
                                    <MaterialIcons name={'more-horiz'} size={28} color={'white'}/>
                                </View>
                                : null
                        }
                        if (item.type === 'dayMarker') {
                            return (
                                <Card style={styles.dayMarker}><Text style={styles.dayMarkerText}>{item.dayLabel}</Text></Card>
                            );
                        }
                        let isMyMessage = item.senderType==='Merchant';

                        return (
                            <Pressable
                                onLongPress={async () => {
                                    await copyContent(item.message);
                                    setSnackbarVisible(true); // Show snackbar
                                }}
                                style={({ pressed }) => [
                                    {
                                        alignSelf: isMyMessage ? "flex-end" : "flex-start",
                                    },
                                    pressed && { opacity: 0.7 }, // Optional visual feedback on long press
                                ]}
                            >
                                <View
                                    style={{
                                        ...styles.messageContainer,
                                        backgroundColor: isMyMessage ? theme.colors.primary : theme.colors.secondary,
                                    }}
                                >
                                    <Text style={styles.messageText}>{item.message}</Text>
                                    <View style={styles.timeAndReadContainer}>
                                        <Text style={styles.timeText}>
                                            {formatTimestamp(item.created_at)}
                                        </Text>
                                        {isMyMessage && (
                                            <View style={{ marginLeft: 4 }}>
                                                {!item.read_at ? (
                                                    <MaterialIcons name="check" size={16} color="white" />
                                                ) : (
                                                    <MaterialIcons name="done-all" size={16} color="white" />
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </Pressable>
                                )

                    }}
                    onContentSizeChange={scrollToEnd} // Automatically scroll to the end when the content changes
                    keyboardShouldPersistTaps="handled" // Ensure taps dismiss the keyboard when necessary
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        mode={'outlined'}
                        value={message}
                        onChangeText={handleTyping}
                        placeholder="Type a message"
                        style={[styles.textInput, {paddingVertical: Platform.OS==='android' ? 8: 0}]}
                        // numberOfLines={5}
                        multiline
                        dense={Platform.OS==='ios'}
                    />
                    <Button mode="contained" onPress={handleSendMessage} style={styles.sendButton}>
                        Send
                    </Button>
                </View>
                {Platform.OS === 'ios' && <KeyboardSpacer />}
                <Snackbar
                    visible={isSnackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={2000}
                    wrapperStyle={{top: 0}}
                    style={{backgroundColor: theme.colors.softSuccess, }}
                    theme={{ colors: { inverseOnSurface: 'black'}}}
                >
                    Message copied!
                </Snackbar>
            </View>
    );
};

export default ChatScreen;

const makeStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        position: 'relative'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#fff',
    },
    textInput: {
        flex: 1,
        // borderWidth: 1,
        borderColor: 'black',
        // borderRadius: 8,
        // padding: 8,
        marginRight: 8,
        backgroundColor: 'white',
    },
    sendButton: {
        alignSelf: 'center',
    },
    dayMarker: {
        alignSelf: 'center',
        textAlign: 'center',
        marginVertical: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        // borderWidth: 1,
        // borderColor: '#eee',
        backgroundColor: theme.colors.softSuccess
    },
    dayMarkerText: {
        alignSelf: 'center',
        textAlign: 'center',
        // marginVertical: 16,
        // paddingHorizontal: 16,
        // paddingVertical: 8,
        // borderRadius: 16,
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    messageContainer: {
        position: 'relative',
        minWidth: 100,
        maxWidth: "70%",
        marginVertical: 3,
        marginHorizontal: 16,
        // paddingVertical: 10,
        flexDirection: "row",
        borderRadius: 10,
        // padding: 16,
        // backgroundColor: 'blue'

    },
    messageText: {
        fontSize: 16,
        maxWidth: "70%",
        color: 'white',
        marginTop: 8,
        marginHorizontal: 16,
        marginBottom: 24,
        // backgroundColor: 'blue'
    },
    timeAndReadContainer: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        // paddingBottom: 2,
        // paddingHorizontal: 8,
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexDirection: 'row',
        // backgroundColor:'black'
    },
    timeText: {
        fontSize: 12,
        color: 'white',
    },
    typingIndicator: {
        marginVertical: 3,
        marginHorizontal: 16,
        paddingHorizontal: 10,
        flexDirection: "row",
        borderRadius: 10,

    },
});