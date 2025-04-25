import { useQuery } from "react-query";
import axiosClient from "../client";

// Fetch storefront data API
export const fetchStoreDetails = async (storeId) => {
    const { data } = await axiosClient.get(`/stores/${storeId}/storeDetails`);
    return data;
};

// Custom React Query hook
export const useStoreDetails = (storeId) => {
    return useQuery(
        ["storeDetails", storeId],
        () => fetchStoreDetails(storeId),
        {
            enabled: !!storeId, // Only fetch if storeId exists
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // Cache data for 10 minutes after becoming stale
        }
    );
};