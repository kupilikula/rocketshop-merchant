import { useMutation, useQueryClient } from 'react-query';
import { getAxiosClient } from '../client'; // Adjust path if needed

/**
 * A React Query mutation hook to cancel the user's active subscription.
 *
 * @param {object} options - React Query mutation options, like onSuccess and onError.
 */
export const useCancelSubscription = (options) => {
    const axiosClient = getAxiosClient();
    const queryClient = useQueryClient(); // Get the query client instance

    const cancelSubscription = async (storeId) => {
        const { data } = await axiosClient.post(`/stores/${storeId}/cancelSubscription`);
        return data;
    };

    return useMutation(cancelSubscription, {
        onSuccess: () => {
            console.log("Subscription cancelled, invalidating status query...");
            queryClient.invalidateQueries(['subscriptionStatus']);
        },
        ...options, // Pass through component-specific options
    });
};