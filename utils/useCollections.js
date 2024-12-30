import { useQuery } from "react-query";
import axios from "axios";

/**
 * Fetch the list of collections for the store.
 */
export const useCollections = () => {
    return useQuery(
        "collections",
        async () => {
            const response = await axios.get("/api/merchants/collections");
            return response.data;
        },
        {
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        }
    );
};