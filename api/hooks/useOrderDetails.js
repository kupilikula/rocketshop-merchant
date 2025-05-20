import { useQuery } from "react-query";
import { getAxiosClient } from "../client";
/**
 * Fetch details of a specific order.
 * @param storeId
 * @param {string} orderId - The ID of the order.
 */
export const useOrderDetails = (storeId, orderId) => {
    const axiosClient = getAxiosClient();
    return useQuery(
        ["order", orderId],
        async () => {
            const response = await axiosClient.get(`/stores/${storeId}/orders/${orderId}`);
            return response.data;
        },
        {
            enabled: !!orderId, // Only fetch if orderId is provided
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};