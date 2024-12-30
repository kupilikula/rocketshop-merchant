import { useQuery } from "react-query";
import axiosClient from "../client";

/**
 * Fetch the list of collections for the store.
 */
export const useCollections = (storeId) => {
    return useQuery(
        "collections",
        async () => {
            const response = await axiosClient.get(`/stores/${storeId}/collections`);
            return response.data;
        },
        {
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        }
    );
};