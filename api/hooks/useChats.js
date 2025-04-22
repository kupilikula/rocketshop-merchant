// hooks/useChatsQuery.js
import { useQuery } from 'react-query';
import axiosClient from '../client';

const fetchChats = async (storeId) => {
    const response = await axiosClient.get('/chats', {params: {storeId: storeId}}); // Replace with your API endpoint
    return response.data;
};

export const useChats = (storeId) => {
    return useQuery('chats', () => fetchChats(storeId), {
        staleTime: 5 * 1000, // 5 seconds
        refetchOnMount: true,
        refetchOnWindowFocus: true, // optional for web-like behavior
        refetchOnFocus: true
    });
};