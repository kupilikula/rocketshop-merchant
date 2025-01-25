// ChatListScreen.js
import React, {useEffect} from 'react';
import { FlatList } from 'react-native';
import {List, ActivityIndicator, Text, Surface, useTheme, Divider, Badge} from 'react-native-paper';
import { useRouter } from 'expo-router';
import {useQuery, useQueryClient} from 'react-query';
import axiosClient from "../../../../api/client";
import {useSelector} from "react-redux";
import {getSocket} from "../../../../api/websocket";

const fetchChats = async (storeId) => {
    const response = await axiosClient.get('/chats', {params: {storeId: storeId}}); // Replace with your API endpoint
    return response.data;
};

const ChatListScreen = () => {
    const { data: chats, isLoading, isError } = useQuery('chats', () => fetchChats(storeId));
    const router = useRouter();
    const theme = useTheme();
    const socket = getSocket();
    const queryClient = useQueryClient();
    const {storeId} = useSelector( (state) => state.store);
    const {unreadMessages} = useSelector((state)=> state.badges);

    useEffect(() => {
        // Listen for newMessage events
        const handleNewMessage = (newMessage) => {
            console.log('New message received:', newMessage);
            // Invalidate the chats query to refresh the data
            queryClient.invalidateQueries(['chats']);
        };

        socket.on('newMessage', handleNewMessage);

        // Cleanup the socket listener on unmount
        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, queryClient]);

    const handleChatPress = (chatId, customerId, customerName, customerPhone) => {
        router.push({ pathname: '/Main/(tabs)/Messaging/chat', params: { chatId, customerId, customerName, customerPhone } });
    };

    if (isLoading) {
        return <ActivityIndicator animating={true} size="large" style={{ flex: 1 }} />;
    }

    if (isError) {
        return <Text>Error loading chats. Please try again later.</Text>;
    }
    console.log('chats:', chats);
    return (
        <Surface style={{backgroundColor: theme.colors.surface, flex: 1, padding: 8}}>
        <FlatList
            data={chats}
            keyExtractor={(item) => item.chatId}
            renderItem={({ item }) => (
                <List.Item
                    title={item.customerName+ ' (' + item.customerPhone +')'}
                    titleStyle={{ fontWeight: 'bold'}}
                    style={{padding: 16, backgroundColor: 'white', height: 80, alignContent: 'center', justifyContent: 'center'}}
                    description={item.lastMessage}
                    right={() => unreadMessages[item.chatId]?.length > 0 ? <Badge>{unreadMessages[item.chatId]?.length}</Badge> : null}
                    onPress={() => handleChatPress(item.chatId, item.customerId, item.customerName, item.customerPhone)}
                />
            )}
            ItemSeparatorComponent={() => <Divider style={{marginVertical: 1}}/>}
            contentContainerStyle={{marginVertical: 16, minHeight: '100%'}}
        />
        </Surface>
    );
};

export default ChatListScreen;