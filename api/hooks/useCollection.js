import { useQuery } from "react-query";
import axiosClient from "../client";

export const useCollection = (storeId, collectionId) => {
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