import { useQuery } from "react-query";
import axios from "axios";

/**
 * Fetch details of a specific order.
 * @param {string} orderId - The ID of the order.
 */
export const useOrderDetails = (storeId, orderId) => {
    return useQuery(
        ["orderDetails", orderId],
        async () => {
            const response = await axios.get(`/stores/${storeId}/orders/${orderId}`);
            return response.data;
        },
        {
            enabled: !!orderId, // Only fetch if orderId is provided
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};