import { useQuery } from "react-query";
import axiosClient from "../client";

/**
 * Fetch the list of collections for the store.
 */
export const useProductTags = (storeId) => {
    return useQuery(
        "productTags",
        async () => {
            const response = await axiosClient.get(`/stores/${storeId}/productTags`);
            return response.data;
        },
        {
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        }
    );
};