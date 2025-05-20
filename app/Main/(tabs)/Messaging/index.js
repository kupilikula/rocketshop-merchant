// ChatListScreen.js
import React, {useEffect} from 'react';
import {FlatList, View} from 'react-native';
import {List, ActivityIndicator, Text, Surface, useTheme, Divider, Badge} from 'react-native-paper';
import { useRouter } from 'expo-router';
import {useQuery, useQueryClient} from 'react-query';
import { getAxiosClient } from "../../../../api/client";
import {useSelector} from "react-redux";
import {useChats} from "../../../../api/hooks/useChats";


const ChatListScreen = () => {
    const {storeId} = useSelector( (state) => state.store);
    const { data: chats, isLoading, isError } = useChats(storeId);
    const router = useRouter();
    const theme = useTheme();
    const {unreadMessages} = useSelector((state)=> state.badges);

    const handleChatPress = (chatId) => {
        router.push({ pathname: '/Main/(tabs)/Messaging/chat', params: { chatId} });
    };

    if (isLoading) {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface}}>
            <ActivityIndicator animating={true} size={100} style={{  justifyContent: 'center', alignItems: 'center' }} />
        </View>;
    }

    if (isError) {
        return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface}}>
            <Text variant={"titleLarge"}>Error Loading Chats</Text>
        </View>
        ;
    }
    console.log('chats:', chats);
    return (
        chats?.length===0 ?
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface}}>
                <Text variant={"titleLarge"}>You Don't Have Any Messages</Text>
            </View> :

        <View style={{backgroundColor: theme.colors.surface, flex: 1, padding: 0}}>
        <FlatList
            data={chats}
            keyExtractor={(item) => item.chatId}
            renderItem={({ item }) => (
                <>
                <List.Item
                    title={item.customerName+ ' (' + item.customerPhone +')'}
                    titleStyle={{ fontWeight: 'bold'}}
                    style={{padding: 0, backgroundColor: 'white', height: 80, alignContent: 'center', justifyContent: 'center'}}
                    description={item.lastMessage}
                    right={() => unreadMessages[item.chatId]?.length > 0 ? <Badge>{unreadMessages[item.chatId]?.length}</Badge> : null}
                    onPress={() => handleChatPress(item.chatId, item.customerId, item.customerName, item.customerPhone)}
                />
                    <Divider style={{marginVertical: 1}}/>
                </>
            )}
            contentContainerStyle={{marginVertical: 16, minHeight: '100%'}}
        />
        </View>
    );
};

export default ChatListScreen;