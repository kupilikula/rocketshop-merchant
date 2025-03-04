// api/hooks/useDeleteShippingRule.js
import { useMutation, useQueryClient } from 'react-query';
import axiosClient from '../client';

export const useDeleteShippingRule = () => {
    const queryClient = useQueryClient();

    return useMutation(
        async ({ storeId, ruleId }) => {
            const response = await axiosClient.delete(`/stores/${storeId}/shipping/${ruleId}/deleteRule`);
            return response.data;
        },
        {
            onSuccess: (_, { storeId }) => {
                queryClient.invalidateQueries(['shippingRules', storeId]);
            },
        }
    );
};