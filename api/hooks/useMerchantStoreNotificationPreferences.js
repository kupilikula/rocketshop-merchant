// hooks/useMerchantNotificationPreferences.js

import { useQuery } from 'react-query';
import { getAxiosClient } from '../client';

/**
 * Fetch merchant's notification preferences for a given store.
 * @param {string} storeId - The store ID for which to fetch preferences
 */
export const useMerchantStoreNotificationPreferences = (storeId, merchantId) => {
    const axiosClient = getAxiosClient();
    return useQuery(
        ['merchantStoreNotificationPreferences', storeId, merchantId],
        async () => {
            const response = await axiosClient.get(`/stores/${storeId}/getNotificationPreferences`);
            return response.data;
        },
        {
            enabled: !!storeId && !!merchantId, // Only run if storeId is available
            staleTime: 0,       // Always get fresh (optional)
        }
    );
};