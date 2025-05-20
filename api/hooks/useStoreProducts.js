import { useQuery } from "react-query";
import { getAxiosClient } from "../client";
/**
 * Fetch all products for a specific store.
 * @param {string} storeId - The ID of the store.
 */

export const fetchStoreProducts = async (storeId) => {
    const axiosClient = getAxiosClient();
    const response = await axiosClient.get(`/stores/${storeId}/products`);
    return response.data;
};

export const useStoreProducts = (storeId) => {
    return useQuery(["storeProducts", storeId], () => fetchStoreProducts(storeId), {
        enabled: !!storeId, // Ensure the query only runs if storeId exists
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};