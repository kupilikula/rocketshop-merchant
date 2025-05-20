// api/hooks/useEditShippingRule.js
import { useMutation, useQueryClient } from 'react-query';
import { getAxiosClient } from '../client';

export const useEditShippingRule = () => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();

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