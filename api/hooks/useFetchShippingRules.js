import { useQuery } from 'react-query';
import axiosClient from '../client';

export const useFetchShippingRules = (storeId, groupingEnabled) => {
    return useQuery(['groupingShippingRules', storeId], async () => {
        const response = await axiosClient.get(`stores/${storeId}/shipping/getRulesWithAssociatedProducts`, {
            params: {
                groupingEnabled
            }
        });
        return response.data;
    }, {
        enabled: !!storeId,
    });
};