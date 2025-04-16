// api/hooks/useGetShippingRules.js
import { useQuery } from 'react-query';
import axiosClient from '../client';

export const useGetShippingRules = (storeId) => {

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