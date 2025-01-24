import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    ScrollView,
    View,
    StyleSheet,
    Platform,
    TouchableWithoutFeedback, FlatList, Pressable,
} from 'react-native';
import { Button, ActivityIndicator, Card, Text, useTheme, TextInput } from 'react-native-paper';
import { useQuery, useQueryClient } from 'react-query';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axiosClient from "../../../../api/client";
import { getSocket } from "../../../../api/websocket";
import KeyboardSpacer from "../../../../components/KeyboardSpacer";
import GenericHeader from "../../../../components/GenericHeader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
    const flatListRef = useRef();
    const theme = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const { data: messages, isLoading } = useQuery(['messages', chatId], () => fetchChatMessages(chatId));

    const [message, setMessage] = useState('');

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
            messageId: Date.now().toString(),
            created_at: new Date(),
        };

        socket.emit('sendMessage', newMessage);

        queryClient.setQueryData(['messages', chatId], (oldMessages) => [
            ...(oldMessages || []),
            newMessage,
        ]);

        setMessage('');
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
        socket.emit('joinChat', { chatId, userId: merchantId, userType: 'Merchant' });

        const handleReceiveMessage = (newMessage) => {
            queryClient.setQueryData(['messages', chatId], (oldMessages) => [
                ...(oldMessages || []),
                newMessage,
            ]);
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.emit('leaveChat', { chatId, userId: merchantId });
        };
    }, [chatId, merchantId]);

    if (isLoading) {
        return <ActivityIndicator animating={true} size="large" style={{ flex: 1 }} />;
    }

    return (
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={messages} // Use the messages array as the data source
                    keyExtractor={(item) => item.messageId} // Provide a unique key for each message
                    renderItem={({ item }) => (
                        <Card
                            style={{
                                margin: 8,
                                alignSelf: item.senderType === 'Customer' ? 'flex-start' : 'flex-end',
                                backgroundColor:
                                    item.senderType === 'Customer'
                                        ? theme.colors.softPrimary
                                        : theme.colors.softSecondary,
                            }}
                        >
                            <Card.Content>
                                <Text>{item.message}</Text>
                            </Card.Content>
                        </Card>
                    )}
                    contentContainerStyle={{
                        paddingBottom: 16,
                        width: '100%',
                        flexGrow: 1, // Ensure content takes up full available height
                        justifyContent: 'flex-end', // Align messages to the bottom
                    }}
                    onContentSizeChange={scrollToEnd} // Automatically scroll to the end when the content changes
                    keyboardShouldPersistTaps="handled" // Ensure taps dismiss the keyboard when necessary
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        mode={'outlined'}
                        value={message}
                        onChangeText={setMessage}
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
            </View>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
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
});