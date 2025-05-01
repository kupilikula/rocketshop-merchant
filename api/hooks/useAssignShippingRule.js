// src/api/hooks/useAssignShippingRule.js or .ts
import { useMutation } from 'react-query';
import axiosClient from '../client';

export const useAssignShippingRule = (storeId) => {
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