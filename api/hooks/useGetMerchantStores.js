// src/api/hooks/useGetMerchantStores.js
import { useQuery } from 'react-query';
import axiosClient from '../../api/client';

export const useGetMerchantStores = (merchantId) => {
    return useQuery({
        queryKey: ['merchantStores', merchantId],
        queryFn: async () => {
            const { data } = await axiosClient.get(`/merchant/${merchantId}/getAllStores`);
            return data;  // Assuming data is an array of stores
        },
        staleTime: 1000 * 60 * 5, // 5 minutes (optional tuning)
    });
};