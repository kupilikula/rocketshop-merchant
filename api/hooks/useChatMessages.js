// hooks/useChatMessages.js
import { useQuery, useQueryClient } from 'react-query';
import { getAxiosClient } from '../client';

const fetchChatMessages = async (chatId) => {
    const axiosClient = getAxiosClient();
    const response = await axiosClient.get(`/chats/${chatId}/messages`);
    return response.data; // Includes read_at from backend for the current customer
};

export const useChatMessages = (chatId) => {

    return useQuery(['messages', chatId], () => fetchChatMessages(chatId), {
        enabled: !!chatId,
        staleTime: 0,
    });
};