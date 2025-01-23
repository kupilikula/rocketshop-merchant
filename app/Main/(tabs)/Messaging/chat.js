import React, { useEffect, useState } from 'react';
import {KeyboardAvoidingView, View, Platform} from 'react-native';
import { FlatList, TextInput } from 'react-native';
import { Button, ActivityIndicator, Text, Card } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {useLocalSearchParams, useRouter} from 'expo-router';
import { io } from 'socket.io-client';
import axiosClient, {BASE_URL} from "../../../../api/client";
import {useSelector} from "react-redux";
import {getSocket} from "../../../../api/websocket";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const fetchChatMessages = async (chatId) => {
    const response = await axiosClient.get(`/chats/${chatId}/messages`); // Replace with your API endpoint
    return response.data;
};

const sendMessageToApi = async ({ chatId, senderId, senderType, message }) => {
    return { chatId, senderId, senderType, message, messageId: Date.now().toString(), created_at: new Date() }; // Mock response
};

const ChatScreen = () => {
    const { chatId, recipientId, recipientName } = useLocalSearchParams();
    const { merchantId } = useSelector((state) => state.merchant);
    const queryClient = useQueryClient();
    const socket = getSocket(); // Use the singleton connection


    const { data: messages, isLoading } = useQuery(['messages', chatId], () => fetchChatMessages(chatId));

    const [message, setMessage] = useState('');
    const insets = useSafeAreaInsets();
    const handleSendMessage = () => {
        if (!message.trim()) return;

        // Emit the message directly via WebSocket
        const newMessage = {
            chatId,
            senderId: merchantId,
            senderType: 'Merchant',
            message,
            messageId: Date.now().toString(), // Generate a temporary ID
            created_at: new Date(), // Temporary timestamp
        };

        socket.emit('sendMessage', newMessage); // Send message via WebSocket
        setMessage(''); // Clear input

        // Optimistically update the UI
        queryClient.setQueryData(['messages', chatId], (oldMessages) => [
            ...(oldMessages || []),
            newMessage,
        ]);
    };

    useEffect(() => {
        // Join the chat room
        socket.emit('joinChat', { chatId, userId: merchantId, userType: 'Merchant' });

        // Listen for incoming messages
        const handleReceiveMessage = (newMessage) => {
            queryClient.setQueryData(['messages', chatId], (oldMessages) => [
                ...(oldMessages || []),
                newMessage,
            ]);
        };

        socket.on('receiveMessage', handleReceiveMessage);

        // Cleanup WebSocket listeners on unmount
        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
            socket.emit('leaveChat', { chatId, userId: merchantId });
        };
    }, [chatId, merchantId]);

    if (isLoading) {
        return <ActivityIndicator animating={true} size="large" style={{ flex: 1 }} />;
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Use `padding` for iOS and `height` for Android
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 + insets.top : 0} // Adjust based on your header height
        >
            <FlatList
                data={messages}
                keyExtractor={(item) => item.messageId}
                renderItem={({ item }) => (
                    <Card style={{ margin: 8, alignSelf: item.senderType === 'Customer' ? 'flex-end' : 'flex-start' }}>
                        <Card.Content>
                            <Text>{item.message}</Text>
                        </Card.Content>
                    </Card>
                )}
            />
            <View style={{ flexDirection: 'row', padding: 8 }}>
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message"
                    style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 10 }}
                />
                <Button mode="contained" onPress={handleSendMessage} style={{ marginLeft: 8 }}>
                    Send
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatScreen;