import { useQuery } from "react-query";
import { getAxiosClient } from "../client";
/**
 * Fetch a specific offer by ID.
 * @param {string} storeId - The ID of the store.
 * @param {string} offerId - The ID of the offer.
 */
export const useOffer = (storeId, offerId) => {
    const axiosClient = getAxiosClient();
    return useQuery(
        ["offer", storeId, offerId],
        async () => {
            const response = await axiosClient.get(`/stores/${storeId}/offers/${offerId}`);
            return response.data;
        },
        {
            enabled: !!storeId && !!offerId, // Only fetch if both storeId and offerId are provided
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};