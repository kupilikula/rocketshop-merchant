import { useQuery } from "react-query";
import { getAxiosClient } from "../client";

/**
 * Fetch the list of collections for the store.
 */
export const useCollections = (storeId) => {
    const axiosClient = getAxiosClient();
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