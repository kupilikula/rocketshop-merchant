import { useQuery } from "react-query";
import axios from "axios";

/**
 * Fetch the list of collections for the store.
 */
export const useCollections = (storeId) => {
    return useQuery(
        "collections",
        async () => {
            const response = await axios.get(`/stores/${storeId}/collections`);
            return response.data;
        },
        {
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        }
    );
};