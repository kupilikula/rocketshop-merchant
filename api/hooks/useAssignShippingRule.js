// src/api/hooks/useAssignShippingRule.js or .ts
import { useMutation } from 'react-query';
import { getAxiosClient } from '../client';

export const useAssignShippingRule = (storeId) => {
    const axiosClient = getAxiosClient();

    return useMutation({
        mutationFn: async ({ productId, shippingRuleId }) => {
            const res = await axiosClient.post(`/stores/${storeId}/shipping/associateRuleWithProduct`, {
                productId,
                shippingRuleId
            });
            return res.data;
        },
    });
};