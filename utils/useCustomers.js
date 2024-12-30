import { useQuery } from "react-query";
import axios from "axios";

export const useCustomers = () => {
    return useQuery(
        "customers",
        async () => {
            const { data } = await axios.get("/api/customers");
            return data; // Assumes the API returns an array of customer objects
        },
        {
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};