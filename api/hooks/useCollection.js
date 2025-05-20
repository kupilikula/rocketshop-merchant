import { useQuery } from "react-query";
import { getAxiosClient } from "../client";

export const useCollection = (storeId, collectionId) => {
    const axiosClient = getAxiosClient();
    return useQuery(
        ["collection", collectionId],
        async () => {
            const { data } = await axiosClient.get(`/stores/${storeId}/collections/${collectionId}`);
            return data;
        },
        {
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        }
    );
};