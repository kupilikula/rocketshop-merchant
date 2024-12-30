import { useQuery } from "react-query";
import axios from "axios";

export const useCustomerDetails = (storeId, customerId) => {
    return useQuery(
        ["customerDetails", customerId],
        async () => {
            const { data } = await axios.get(`/stores/${storeId}/customers/${customerId}`);
            return data; // Assumes the API returns the customer object
        },
        {
            enabled: !!customerId, // Ensure the query runs only when customerId is available
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};