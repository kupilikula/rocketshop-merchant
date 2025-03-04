// api/hooks/useReorderShippingRules.js
import { useMutation, useQueryClient } from 'react-query';
import axiosClient from '../client';

export const useReorderShippingRules = () => {
    const queryClient = useQueryClient();

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