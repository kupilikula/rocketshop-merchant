import { useQuery } from "react-query";
import axios from "axios";

/**
 * Fetch offers for a store
 * @param {string} storeId - ID of the store
 */
export const useOffers = (storeId) => {
    return useQuery(
        ["offers", storeId],
        async () => {
            const response = await axios.get(`/api/merchants/stores/${storeId}/offers`);
            return response.data;
        },
        {
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
            enabled: !!storeId, // Only run query if storeId is available
        }
    );
};