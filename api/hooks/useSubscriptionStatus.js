// src/hooks/useSubscriptionStatus.js

import { useQuery } from 'react-query';
import { getAxiosClient } from '../client'; // Adjust this path if needed

/**
 * A React Query hook to fetch the subscription status for the
 * currently authenticated user's store.
 */
export const useSubscriptionStatus = (storeId) => {
    const axiosClient = getAxiosClient();

    return useQuery(
        ['subscriptionStatus', storeId],
        async () => {
            const { data } = await axiosClient.get(`/stores/${storeId}/getSubscriptionStatus`);
            return data;
        },
        {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
            enabled: !!storeId,
        }
    );
};