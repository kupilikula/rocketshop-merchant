// src/api/hooks/useAssignShippingRule.js or .ts
import { useMutation } from 'react-query';
import { getAxiosClient } from '../client';

export const useAssignShippingRule = (storeId) => {
    const axiosClient = getAxiosClient();

    return useMutation({
        mutationFn: async ({ productId, shippingRuleId }) => {
            const res = await axiosClient.patch(`/stores/${storeId}/shipping/rules/${shippingRuleId}/products/${productId}/associate`);
            return res.data;
        },
    });
};