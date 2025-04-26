// hooks/useStoreInfoFromChat.js

import { useQuery } from 'react-query';
import axiosClient from '../client';

/**
 * Fetch store info (storeId, storeName, storeLogoImage) from chatId
 * @param {string} chatId - The chatId to fetch store info for
 */
export const useGetCustomerDetailsFromChatId = (chatId) => {
    return useQuery(
        ['customerDetailsFromChatId', chatId],
        async () => {
            const response = await axiosClient.get(`/getCustomerDetailsFromChatId`, {
                params: { chatId }
            });
            return response.data;
        },
        {
            enabled: !!chatId, // Only run if chatId is available
            staleTime: 0,       // Always get fresh (optional)
        }
    );
};