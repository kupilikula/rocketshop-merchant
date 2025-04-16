// api/hooks/useEditShippingRule.js
import { useMutation, useQueryClient } from 'react-query';
import axiosClient from '../client';

export const useEditShippingRule = () => {
    const queryClient = useQueryClient();

    return useMutation(
        async ({ storeId, ruleId, data }) => {
            const response = await axiosClient.put(`/stores/${storeId}/shipping/${ruleId}/editRule`, data);
            return response.data;
        },
        {
            onSuccess: (_, { storeId }) => {
                queryClient.invalidateQueries(['shippingRules', storeId]);
            },
        }
    );
};