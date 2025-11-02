import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    Keyboard, View, StyleSheet, Platform, FlatList, Pressable, useWindowDimensions, ActivityIndicator
} from 'react-native';
import {Button, Card, Text, useTheme, TextInput, Snackbar, Divider} from 'react-native-paper';
import {useQueryClient} from 'react-query';
import {useFocusEffect, useLocalSearchParams, useRouter} from 'expo-router';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getAxiosClient} from "../../../../api/client";
import {disconnectSocket, getSocket, logActiveSockets} from "../../../../api/websocket";
import KeyboardSpacer from "../../../../components/KeyboardSpacer";
import GenericHeader from "../../../../components/GenericHeader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {format, isToday, isYesterday} from 'date-fns';
import {v4 as uuidv4} from 'uuid';
import {removeUnreadMessages} from "../../../../store/badgesSlice";
import {copyContent} from "../../../../utils/copyToClipboard";
import {useChatMessages} from "../../../../api/hooks/useChatMessages";
import {useGetCustomerDetailsFromChatId} from "../../../../api/hooks/useGetCustomerDetailsFromChatId";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {getCustomerPath, getMessagingPath} from "../../../../utils/getPathUtils";

const IS_WEB = Platform.OS === 'web';

const ChatScreen = () => {
    const {chatId} = useLocalSearchParams();
    const {data: customer} = useGetCustomerDetailsFromChatId(chatId);
    const customerName = customer?.fullName;
    const customerId = customer?.customerId;

    const {merchantId} = useSelector((state) => state.merchant);
    const {storeId} = useSelector((state) => state.store);
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    const router = useRouter();
    const [socket, setSocket] = useState(null);
    const dispatch = useDispatch();
    const flatListRef = useRef(null);
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const {width: windowWidth} = useWindowDimensions();
    const styles = useMemo(() => makeStyles(theme, IS_WEB, windowWidth, insets), [theme, IS_WEB, windowWidth, insets]);

    const [otherUserIsTyping, setOtherUserIsTyping] = useState(false);
    const typingDebounceRef = useRef(null);
    const stopTypingTimeoutRef = useRef(null);
    // useChatMessages hook should return messages sorted chronologically (oldest first)
    const {data: messagesData, isLoading, isError} = useChatMessages(chatId);
    const messages = useMemo(() => messagesData || [], [messagesData]);

    const [message, setMessage] = useState('');
    const [isSnackbarVisible, setSnackbarVisible] = useState(false);
    const processedMessagesRef = useRef(new Set());

    useEffect(() => {
        if (!chatId && !isLoading) {
            router.replace(getMessagingPath());
        }
    }, [chatId, isLoading, router]);

    useFocusEffect(useCallback(() => {
        if (chatId) {
            queryClient.invalidateQueries(['messages', chatId]);
        }
    }, [chatId, queryClient]));

    const scrollToLatest = useCallback((animated = false, useDelay = true) => {
        console.log("scrollToLatest called");
        if (flatListRef.current && messages && messages.length > 0) {
            if (IS_WEB) {
                setTimeout(() => flatListRef.current?.scrollToIndex({index: 0, animated}), 50);
            } else if (useDelay) {
                let delay = Platform.OS === 'android' ? 500 : 200;
                setTimeout(() => flatListRef.current?.scrollToIndex({index: 0, animated}), delay);
            } else {
                flatListRef.current?.scrollToIndex({index: 0, animated});
            }
        }
    }, [messages]); // Dependency on messages array reference

    const handleSendMessage = async () => {
        if (!message.trim() || !socket) return;
        const newMessage = {
            chatId,
            senderId: merchantId,
            senderType: 'Merchant',
            message: message.trim(),
            messageId: uuidv4(),
            created_at: new Date().toISOString() // Use ISO string for consistency
        };
        let ackReceived = false;
        try {
            socket.emit('stopTyping', {chatId, senderId: merchantId});
            socket.timeout(3000).emit('sendMessage', newMessage, (err, ackResponse) => {
                if (err) {
                    console.log('Socket ack timeout/error (Merchant):', err);
                    return;
                }
                if (ackResponse?.status === 'ok') {
                    ackReceived = true;
                    console.log('Socket ack received (Merchant)', ackResponse);
                } else {
                    console.log('Socket ack error/unexpected (Merchant):', ackResponse);
                }
            });
            // **CRITICAL CHANGE: APPEND new message for chronological order**
            queryClient.setQueryData(['messages', chatId], (oldMessages = []) => [...oldMessages, newMessage]);
            setMessage('');
            // scrollToLatest(true, false); // Let FlatList's inverted behavior and data update handle scroll
            setTimeout(() => {
                if (!ackReceived) {
                    sendMessageViaApi(newMessage);
                }
            }, 4000);
        } catch (err) {
            console.log('Merchant handleSendMessage error:', err);
        }
    };

    const sendMessageViaApi = useCallback(async (apiMessage) => {
        try {
            await axiosClient.post(`/chats/${chatId}`, apiMessage);
        } catch (err) {
            console.error('API fallback failed:', err);
        }
    }, [axiosClient, chatId]);

    const handleTyping = (text) => {
        setMessage(text);
        clearTimeout(stopTypingTimeoutRef.current);
        if (socket) {
            if (!typingDebounceRef.current) {
                socket.emit('typing', {chatId, senderId: merchantId});
                typingDebounceRef.current = setTimeout(() => {
                    typingDebounceRef.current = null;
                }, 1000);
            }
            stopTypingTimeoutRef.current = setTimeout(() => {
                socket.emit('stopTyping', {chatId, senderId: merchantId});
                stopTypingTimeoutRef.current = null;
            }, 1000);
        }
    };

    useEffect(() => {
        const socketType = "chat";
        let currentSocketInstance = null; // Use a local variable for the instance in this effect

        const initializeSocket = async () => {
            if (!chatId || !storeId || !merchantId) {
                console.log("Skipping socket initialization, missing IDs", {chatId, storeId, merchantId});
                return;
            }
            console.log("Initializing socket in Merchant chat window for chatID:", chatId);
            currentSocketInstance = await getSocket(socketType, chatId, storeId);
            if (!currentSocketInstance) {
                console.error("Failed to initialize chat socket (Merchant).");
                return;
            }
            setSocket(currentSocketInstance); // Update state with the connected socket

            const joinRoom = () => currentSocketInstance.emit("joinChat", {
                chatId,
                userId: merchantId,
                userType: "Merchant"
            });
            const handleReceiveMessage = (newMessage) => {
                console.log("New message received in merchant app:", newMessage);
                queryClient.setQueryData(["messages", chatId], (oldMessages = []) => {
                    const existing = oldMessages.find((m) => m.messageId === newMessage.messageId);
                    if (existing) {
                        return oldMessages.map((m) => m.messageId === newMessage.messageId ? {...m, ...newMessage} : m);
                    }
                    // **CRITICAL CHANGE: APPEND new message**
                    return [...oldMessages, newMessage];
                });
            };
            const handleMessagesRead = ({chatId: msgReadChatId, messageIds, readerId}) => {
                if (msgReadChatId === chatId) {
                    console.log("Merchant app: messagesRead event", messageIds);
                    queryClient.setQueryData(["messages", chatId], (oldMessages = []) => oldMessages.map((msg) => messageIds.includes(msg.messageId) && !msg.read_at ? {
                        ...msg,
                        read_at: new Date().toISOString()
                    } : msg));
                }
            };
            const handleTypingIndicator = ({senderId}) => {
                if (senderId !== merchantId) setOtherUserIsTyping(true);
            };
            const handleStopTypingIndicator = ({senderId}) => {
                if (senderId !== merchantId) setOtherUserIsTyping(false);
            };

            currentSocketInstance.on("connect", joinRoom);
            // Emit joinChat immediately if already connected, or rely on 'connect' event
            if (currentSocketInstance.connected) {
                joinRoom();
            }
            currentSocketInstance.on("receiveMessage", handleReceiveMessage);
            currentSocketInstance.on("messagesRead", handleMessagesRead);
            currentSocketInstance.on("typing", handleTypingIndicator);
            currentSocketInstance.on("stopTyping", handleStopTypingIndicator);
        };

        initializeSocket();

        return () => {
            if (currentSocketInstance) { // Use the local variable for cleanup
                console.log("Cleaning up socket for chatID (Merchant):", chatId);
                currentSocketInstance.emit("leaveChat", {chatId, userId: merchantId});
                currentSocketInstance.off("connect");
                currentSocketInstance.off("receiveMessage");
                currentSocketInstance.off("messagesRead");
                currentSocketInstance.off("typing");
                currentSocketInstance.off("stopTyping");
                disconnectSocket(socketType, chatId); // Ensure this uses the correct instance if registry is complex
                setSocket(null); // Clear socket from state
            }
        };
    }, [chatId, storeId, merchantId, queryClient, dispatch]); // dispatch was in original deps, keep if used by a handler not shown but called by socket

    useEffect(() => {
        if (IS_WEB) return;
        const onKeyboardShow = () => scrollToLatest(false, true);
        const onKeyboardHide = () => scrollToLatest(false, true);
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', onKeyboardHide);
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [scrollToLatest]);

    logActiveSockets(); // Original

    const formatTimestamp = (dateStr) => format(new Date(dateStr), 'hh:mm a');
    const groupMessagesByDay = useCallback((msgsToGroup) => {
        const grouped = [];
        let lastDay = null;
        (msgsToGroup || []).forEach((msg, index) => {
            const msgDate = new Date(msg.created_at);
            const messageDay = format(msgDate, 'yyyy-MM-dd');
            if (messageDay !== lastDay) {
                lastDay = messageDay;
                const dayLabel = isToday(msgDate) ? 'Today' : isYesterday(msgDate) ? 'Yesterday' : format(msgDate, 'dd MMMM, yyyy'); // Corrected format
                grouped.push({type: 'dayMarker', dayLabel, id: `day-${messageDay}`}); // More stable key for dayMarker
            }
            grouped.push({type: 'message', ...msg, id: msg.messageId || `msg-${uuidv4()}`}); // Ensure unique ID
        });
        // Typing indicator is added *after* messages are grouped, then the whole list is reversed for display.
        // So it will be at the visual bottom of the inverted list.
        grouped.push({type: 'typingIndicator', id: 'typing-indicator'});
        return grouped;
    }, []); // format, isToday, isYesterday are stable imports

    const groupedMessages = useMemo(() => groupMessagesByDay(messages), [messages, groupMessagesByDay]);
    const displayMessages = useMemo(() => [...groupedMessages].reverse(), [groupedMessages]);

    const handleViewableItemsChanged = useCallback(({viewableItems}) => {
        console.log('viewableItems');
        const newReadMessageIds = viewableItems
            .map((itemWrapper) => itemWrapper.item)
            .filter((item) => item.type === "message" && item.senderId !== merchantId && !item.read_at && !processedMessagesRef.current.has(item.messageId))
            .map((message) => message.messageId);

        if (newReadMessageIds.length > 0) {
            newReadMessageIds.forEach((id) => processedMessagesRef.current.add(id));
            axiosClient.patch(`/chats/${chatId}/messages/read`, {messageIds: newReadMessageIds});
            if (socket) {
                socket.emit("messagesRead", {chatId, messageIds: newReadMessageIds, readerId: merchantId});
            }
            dispatch(removeUnreadMessages({chatId, messageIds: newReadMessageIds}));
            queryClient.setQueryData(["messages", chatId], (oldMessages = []) => oldMessages.map((message) => newReadMessageIds.includes(message.messageId) && !message.read_at ? {
                ...message,
                read_at: new Date().toISOString()
            } : message));
        }
    }, [chatId, socket, merchantId, queryClient, dispatch, axiosClient]);

    const onViewableItemsLogicRef = useRef(handleViewableItemsChanged);
    useEffect(() => {
        onViewableItemsLogicRef.current = handleViewableItemsChanged;
    }, [handleViewableItemsChanged]);
    const stableOnViewableItemsChanged = useCallback(({viewableItems, changed}) => {
        onViewableItemsLogicRef.current({viewableItems, changed});
    }, []); // Empty deps for stable ref

    const viewabilityConfig = useRef({itemVisiblePercentThreshold: 80}).current;
    const viewabilityConfigCallbackPairs = useRef([{
        viewabilityConfig,
        onViewableItemsChanged: stableOnViewableItemsChanged
    }]).current;

    // Removed useEffect that called scrollToLatest on groupedMessages change to strictly match customer app pattern

    const chatInterface = () => (<View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={displayMessages}
                contentContainerStyle={styles.flatListContentContainer}
                ItemSeparatorComponent={() => <View style={{height: 10}}/>}
                keyExtractor={(item) => item.id}
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
                keyboardShouldPersistTaps="handled"
                renderItem={({item}) => {
                    if (item.type === 'typingIndicator') {
                        return otherUserIsTyping ? <View style={{
                            ...styles.typingIndicator,
                            alignSelf: "flex-start",
                            backgroundColor: theme.colors.secondary
                        }}>
                            <MaterialIcons name={'more-horiz'} size={28} color={'white'}/>
                        </View> : null;
                    }
                    if (item.type === 'dayMarker') {
                        return (<Card style={styles.dayMarker}><Text style={styles.dayMarkerText}>{item.dayLabel}</Text></Card>);
                    }
                    let isMyMessage = item.senderType === 'Merchant';
                    return (<Pressable
                            onLongPress={async () => {
                                await copyContent(item.message);
                                setSnackbarVisible(true);
                            }}
                            style={({pressed}) => [{alignSelf: isMyMessage ? "flex-end" : "flex-start"}, pressed && {opacity: 0.7}]}
                        >
                            <View style={{
                                ...styles.messageContainer,
                                backgroundColor: isMyMessage ? theme.colors.primary : theme.colors.secondary
                            }}>
                                <Text style={styles.messageText}>{item.message}</Text>
                                <View style={styles.timeAndReadContainer}>
                                    <Text style={styles.timeText}>{formatTimestamp(item.created_at)}</Text>
                                    {isMyMessage && (<View style={{marginLeft: 4}}>
                                        {!item.read_at ? (<MaterialIcons name="check" size={16} color="white"/>) : (
                                            <MaterialIcons name="done-all" size={16} color="white"/>)}
                                    </View>)}
                                </View>
                            </View>
                        </Pressable>);
                }}
                inverted={true}
                style={{flex: 1}} // Ensures FlatList takes available space
            />
            <View style={styles.inputContainer}>
                <TextInput
                    mode={'outlined'}
                    value={message}
                    onChangeText={handleTyping}
                    placeholder="Type a message"
                    style={[styles.textInput, {paddingVertical: Platform.OS === 'android' && !IS_WEB ? 8 : 0}]}
                    multiline
                    dense={Platform.OS === 'ios' && !IS_WEB}
                />
                <Button mode="contained" onPress={handleSendMessage} style={styles.sendButton}>
                    Send
                </Button>
            </View>
            {Platform.OS === 'ios' && !IS_WEB && <KeyboardSpacer/>}
        </View>);

    const headerComponent = (<GenericHeader
            title={customerName || "Chat"}
            right={customerId ? (<Pressable
                    style={{
                        width: 60,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        paddingRight: IS_WEB ? 0 : 10
                    }}
                    onPress={() => router.push(getCustomerPath(customerId))} // Use correct path util
                >
                    <MaterialIcons name={'person'} size={IS_WEB ? 28 : 36}/>
                </Pressable>) : null}
        />);

    const loadingErrorViewWrapper = (contentToWrap) => {
        if (IS_WEB) {
            return (<View style={styles.webPageContainer}>
                    <Card style={styles.webMaxContentWidthWrapper}>
                        {headerComponent}
                        <Divider style={{height: 1, backgroundColor: theme.colors.outlineVariant}}/>
                        <View style={styles.centeredMessageContainer_platform}>{contentToWrap}</View>
                    </Card>
                </View>);
        }
        return <><GenericHeader title="Chat"/>
            {/* For mobile, centeredMessageContainer_platform takes flex:1 and provides its own background */}
            <View style={styles.centeredMessageContainer_platform}>{contentToWrap}</View>
        </>;
    };

    if (isLoading) {
        return loadingErrorViewWrapper(<ActivityIndicator animating={true} size={IS_WEB ? "large" : 100}
                                                          color={theme.colors.primary}/>);
    }
    if (isError) { // Check for isError from useChatMessages
        return loadingErrorViewWrapper(<>
            <MaterialCommunityIcons name="chat-alert-outline" size={IS_WEB ? 60 : 48} color={theme.colors.error}/>
            <Text variant="titleMedium" style={styles.emptyListText_platform}>Error Loading Chat History</Text>
        </>);
    }

    return (<>
            {IS_WEB ? (<View style={styles.webPageContainer}>
                    <View style={styles.webMaxContentWidthWrapper}>
                        {headerComponent}
                        <Divider style={{height: 1, backgroundColor: theme.colors.outlineVariant}}/>
                        {chatInterface()}
                    </View>
                </View>) : (<>
                    {headerComponent}
                    {chatInterface()}
                </>)}
            <Snackbar
                visible={isSnackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
                wrapperStyle={{top: IS_WEB ? (insets.top > 20 ? insets.top + 10 : 70) : (insets.top > 0 ? insets.top : 10)}}
                style={{backgroundColor: theme.colors.softSuccess}}
                theme={{colors: {inverseOnSurface: 'black'}}}
            >
                Message copied!
            </Snackbar>
        </>);
};


const makeStyles = (theme, isWeb, windowWidth, insets) => {
    // Styles definition remains identical to the previous "final" version that worked for layout.
    // The critical fixes are in the JavaScript logic (hooks, state, data flow).
    return StyleSheet.create({
        container: {flex: 1, backgroundColor: 'white', position: 'relative', display: 'flex', flexDirection: 'column'},
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: '#fff',
            borderTopWidth: isWeb ? 0 : StyleSheet.hairlineWidth,
            borderTopColor: isWeb ? 'transparent' : '#ccc'
        },
        textInput: {flex: 1, borderColor: 'black', marginRight: 8, backgroundColor: 'white'},
        sendButton: {alignSelf: 'center'},
        dayMarker: {
            alignSelf: 'center',
            marginVertical: 16,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: theme.colors.softSuccess
        },
        dayMarkerText: {alignSelf: 'center', textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: 'black'},
        messageContainer: {
            minWidth: 100, maxWidth: "70%", marginVertical: 3, marginHorizontal: 16, // paddingVertical: 10,
            flexDirection: "row", borderRadius: 10, flexWrap: 'wrap', // padding: 16,
        },

        messageText: {
            fontSize: 16, color: 'white', flexWrap: 'wrap', marginTop: 8, marginHorizontal: 16, marginBottom: 24,
        },
        timeAndReadContainer: {
            position: 'absolute',
            bottom: 4,
            right: 8,
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexDirection: 'row'
        },
        timeText: {fontSize: 12, color: 'white'},
        typingIndicator: {
            marginVertical: 3,
            marginHorizontal: 16,
            paddingHorizontal: 10,
            flexDirection: "row",
            borderRadius: 10,
            paddingVertical: 8
        },
        webPageContainer: {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
            paddingTop: isWeb ? 20 : 0,
            height: isWeb ? '100vh' : undefined,
            overflow: isWeb ? 'hidden' : undefined
        },
        webMaxContentWidthWrapper: {
            flex: 1,
            width: '100%',
            maxWidth: 800,
            alignSelf: 'center',
            backgroundColor: 'white',
            overflow: 'hidden',
            marginVertical: 20,
            elevation: isWeb ? 4 : 0,
            display: 'flex',
            flexDirection: 'column',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: theme.colors.grayBorder

        },
        flatListContentContainer: {
            paddingBottom: 16,
            width: '100%',
            justifyContent: 'flex-start',
            backgroundColor: 'white',
            flexGrow: 1
        },
        centeredMessageContainer_platform: {
            flex: 1,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
        },
        emptyListText_platform: {textAlign: 'center', marginTop: 20, color: theme.colors.onSurfaceDisabled}
    });
};

export default ChatScreen;