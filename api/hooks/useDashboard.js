import { useQuery } from "react-query";
import { getAxiosClient } from "../client";
/**
 * Fetch all orders for a store.
 * @param {string} storeId - The ID of the store.
 */
export const useDashboard = (storeId) => {
    const axiosClient = getAxiosClient();

    return useQuery(
        ["dashboard", storeId],
        async () => {
            const response = await axiosClient.get(`/stores/${storeId}/dashboard`);
            return response.data;
        },
        {
            enabled: !!storeId, // Fetch only if storeId is provided
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};