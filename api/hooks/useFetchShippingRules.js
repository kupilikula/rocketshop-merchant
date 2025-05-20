import { useQuery } from 'react-query';
import { getAxiosClient } from '../client';

export const useFetchShippingRules = (storeId, groupingEnabled) => {
    const axiosClient = getAxiosClient();
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