// src/api/hooks/useStorePolicy.js
//----------------------------------
// Fetches the store-specific policy.
// • Uses GET  /stores/:storeId/policy
// • Cached with a 5-minute staleTime.
// • Returns { data, isLoading, isError, refetch, ... }

import { useQuery } from 'react-query';
import { getAxiosClient } from "../client";

const fetchStorePolicy = async storeId => {
    const axiosClient = getAxiosClient();
    const { data } = await axiosClient.get(`/stores/${storeId}/storePolicy/getPolicy`);
    return data;
};

export default function useStorePolicy(storeId, options = {}) {
    return useQuery({
        queryKey: ['storePolicy', storeId],
        queryFn: () => fetchStorePolicy(storeId),
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000, // 5 min
        ...options,
    });
}