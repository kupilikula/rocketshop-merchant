import { useQuery } from "react-query";
import axios from "axios";

/**
 * Fetch all products for a specific store.
 * @param {string} storeId - The ID of the store.
 */
export const useStoreProducts = (storeId) => {
    return useQuery(
        ["storeProducts", storeId],
        async () => {
            const response = await axios.get(`/api/merchants/stores/${storeId}/products`);
            return response.data;
        },
        {
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
            enabled: !!storeId, // Only fetch if storeId is provided
        }
    );
};