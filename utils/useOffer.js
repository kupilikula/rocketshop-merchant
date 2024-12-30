import { useQuery } from "react-query";
import axios from "axios";

/**
 * Fetch a specific offer by ID.
 * @param {string} storeId - The ID of the store.
 * @param {string} offerId - The ID of the offer.
 */
export const useOffer = (storeId, offerId) => {
    return useQuery(
        ["offer", storeId, offerId],
        async () => {
            const response = await axios.get(`/api/merchants/stores/${storeId}/offers/${offerId}`);
            return response.data;
        },
        {
            enabled: !!storeId && !!offerId, // Only fetch if both storeId and offerId are provided
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};