import { useQuery } from "react-query";
import { getAxiosClient } from "../client";

export const useCustomers = (storeId) => {
    const axiosClient = getAxiosClient();

    return useQuery(
        "customers",
        async () => {
            const { data } = await axiosClient.get(`/stores/${storeId}/customers`);
            return data; // Assumes the API returns an array of customer objects
        },
        {
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};