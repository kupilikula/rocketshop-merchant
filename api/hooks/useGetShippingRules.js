// api/hooks/useGetShippingRules.js
import { useQuery } from 'react-query';
import { getAxiosClient } from '../client';

export const useGetShippingRules = (storeId) => {
    const axiosClient = getAxiosClient();
    return useQuery(
        ['shippingRules', storeId],
        async () => {
            const response = await axiosClient.get(`/stores/${storeId}/shipping/getRules`);
            return response.data;
        },
        {
            enabled: !!storeId,
        }
    );
};