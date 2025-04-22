// hooks/useChatMessages.js
import { useQuery, useQueryClient } from 'react-query';
import axiosClient from '../client';

const fetchChatMessages = async (chatId) => {
    const response = await axiosClient.get(`/chats/${chatId}/messages`);
    return response.data; // Includes read_at from backend for the current customer
};

export const useChatMessages = (chatId) => {
    const queryClient = useQueryClient();

    return useQuery(['messages', chatId], () => fetchChatMessages(chatId), {
        enabled: !!chatId,
        staleTime: 0,
        onSuccess: (fetchedMessages) => {
            queryClient.setQueryData(['messages', chatId], (oldMessages) => {
                if (!oldMessages) return fetchedMessages;

                return fetchedMessages.map((fetched) => {
                    const existing = oldMessages.find(m => m.messageId === fetched.messageId);
                    return {
                        ...fetched,
                        read_at: fetched.read_at ?? existing?.read_at ?? null,
                    };
                });
            });
        },
    });
};