import { useQuery } from "react-query";
import axiosClient from "../client";
export const useCustomerDetails = (storeId, customerId) => {
    return useQuery(
        ["customerDetails", customerId],
        async () => {
            const { data } = await axiosClient.get(`/stores/${storeId}/customers/${customerId}`);
            return data; // Assumes the API returns the customer object
        },
        {
            enabled: !!customerId, // Ensure the query runs only when customerId is available
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};