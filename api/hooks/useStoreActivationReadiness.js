import { useQuery } from 'react-query';
import { getAxiosClient } from '../client'; // Adjust path if needed

/**
 * A React Query hook to check if a store is ready for activation.
 * This query is disabled by default and should be triggered manually with refetch().
 * * @param {string} storeId - The ID of the store to check.
 * @param {object} options - React Query options, including onSuccess and onError callbacks.
 */
export const useStoreActivationReadiness = (storeId, options) => {
    const axiosClient = getAxiosClient();

    return useQuery(
        // The query key is scoped to the specific storeId
        ['storeActivationReadiness', storeId],
        async () => {
            const { data } = await axiosClient.get(`/stores/${storeId}/canActivate`);
            return data;
        },
        {
            // IMPORTANT: This query is disabled by default.
            // We will trigger it manually using the `refetch` function.
            enabled: false,
            // We don't want to cache this check for long, as the state can change.
            staleTime: 0,
            cacheTime: 0,
            // Pass through component-specific options like onSuccess
            ...options,
        }
    );
};