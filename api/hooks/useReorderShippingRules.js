// api/hooks/useReorderShippingRules.js
import { useMutation, useQueryClient } from 'react-query';
import { getAxiosClient } from '../client';

export const useReorderShippingRules = () => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    return useMutation(
        async ({ storeId, data }) => {
            console.log('storeId:', storeId);
            console.log('data:', data);
            const response = await axiosClient.put(`/stores/${storeId}/shipping/reorderRules`, data);
            return response.data;
        },
        {
            onSuccess: (_, { storeId }) => {
                queryClient.invalidateQueries(['shippingRules', storeId]);
            },
        }
    );
};