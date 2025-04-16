// api/hooks/useGetShippingRule.js
import { useQuery } from 'react-query';
import axiosClient from '../client';

export const useGetShippingRule = (storeId, ruleId) => {

    return useQuery(
        ['shippingRule', storeId, ruleId],
        async () => {
            const response = await axiosClient.get(`/stores/${storeId}/shipping/${ruleId}/getRule`);
            return response.data;
        },
        {
            enabled: !!storeId && !!ruleId,
        }
    );
};