// api/hooks/useAddShippingRule.js
import { useMutation, useQueryClient } from 'react-query';
import axiosClient from '../client';

export const useAddShippingRule = () => {
    const queryClient = useQueryClient();

    return useMutation(
        async ({ storeId, data }) => {
            const response = await axiosClient.post(`/stores/${storeId}/shipping/addRule`, data);
            return response.data;
        },
        {
            onSuccess: (_, { storeId }) => {
                queryClient.invalidateQueries(['shippingRules', storeId]);
            },
        }
    );
};