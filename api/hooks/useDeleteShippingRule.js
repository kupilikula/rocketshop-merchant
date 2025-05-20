// api/hooks/useDeleteShippingRule.js
import { useMutation, useQueryClient } from 'react-query';
import { getAxiosClient } from '../client';

export const useDeleteShippingRule = () => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();

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