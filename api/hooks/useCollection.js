import { useQuery } from "react-query";
import axios from "axios";

export const useCollection = (storeId, collectionId) => {
    return useQuery(
        ["collection", collectionId],
        async () => {
            const { data } = await axios.get(`/stores/${storeId}/collections/${collectionId}`);
            return data;
        },
        {
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        }
    );
};