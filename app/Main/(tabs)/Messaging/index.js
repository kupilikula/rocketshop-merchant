// ChatListScreen.js
import React from 'react';
import { FlatList } from 'react-native';
import { List, ActivityIndicator, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from 'react-query';
import axiosClient from "../../../../api/client";
import {useSelector} from "react-redux";

const fetchChats = async (storeId) => {
    const response = await axiosClient.get('/chats', {params: {storeId: storeId}}); // Replace with your API endpoint
    return response.data;
};

const ChatListScreen = () => {
    const router = useRouter();
    const {storeId} = useSelector( (state) => state.store);
    const { data: chats, isLoading, isError } = useQuery('chats', () => fetchChats(storeId));

    const handleChatPress = (chatId, recipientId, recipientName) => {
        router.push({ pathname: '/Main/(tabs)/Messaging/chat', params: { chatId, recipientId, recipientName } });
    };

    if (isLoading) {
        return <ActivityIndicator animating={true} size="large" style={{ flex: 1 }} />;
    }

    if (isError) {
        return <Text>Error loading chats. Please try again later.</Text>;
    }

    return (
        <FlatList
            data={chats}
            keyExtractor={(item) => item.chatId}
            renderItem={({ item }) => (
                <List.Item
                    title={item.recipientName}
                    description={item.lastMessage}
                    onPress={() => handleChatPress(item.chatId, item.recipientId, item.recipientName)}
                />
            )}
        />
    );
};

export default ChatListScreen;