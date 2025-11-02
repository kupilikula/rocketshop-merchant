import { useMutation } from 'react-query';
import { getAxiosClient } from '../client'; // Adjust path if needed

/**
 * A React Query mutation hook to create a new subscription.
 * It calls the backend, which returns a Razorpay payment URL.
 *
 * @param {object} options - React Query mutation options, like onSuccess and onError.
 */
export const useCreateSubscription = (options) => {
    const axiosClient = getAxiosClient();

    const createSubscription = async ({ planType, storeId }) => {
        const { data } = await axiosClient.post(`/stores/${storeId}/subscriptions`, {
            planType,
            storeId,
        });
        return data; // This should return { subscription_url: '...' }
    };

    return useMutation(createSubscription, {
        // You can add default mutation options here, like a default onError handler.
        ...options, // Pass through component-specific options like onSuccess.
    });
};