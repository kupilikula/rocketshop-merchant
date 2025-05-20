import { useMutation, useQueryClient } from 'react-query';
import { getAxiosClient } from '../client';

export const useUpdateShippingRule = (storeId) => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    return useMutation(
        async ({ shippingRuleId, updatedRule }) => {
            const response = await axiosClient.patch(
                `/stores/${storeId}/shipping/updateRule?shippingRuleId=${shippingRuleId}`,
                updatedRule
            );
            return response.data;
        },
        {
            onSuccess: (_data, variables) => {
                // Optionally invalidate or refetch queries involving this rule
                queryClient.invalidateQueries(['shippingRule', variables.shippingRuleId]);
                queryClient.invalidateQueries(['shippingRuleForProduct']);

            },
            onError: (error) => {
                console.error('Failed to update shipping rule:', error);
            },
        }
    );
};