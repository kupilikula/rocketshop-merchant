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
            const { data } = await axiosClient.get(`/stores/${storeId}/subscriptions`);
            return data;
        },
        {
            staleTime: 0,
            refetchOnWindowFocus: false,
            retry: 1,
            enabled: !!storeId,
        }
    );
};