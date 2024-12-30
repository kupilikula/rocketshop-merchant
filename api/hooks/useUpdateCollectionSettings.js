import { useMutation, useQueryClient } from "react-query";
import axiosClient from "../client";
export const useUpdateCollectionSettings = (storeId, collectionId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (settings) => {
            await axiosClient.patch(`/stores/${storeId}/collections/${collectionId}`, settings);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["collection", collectionId]);
            },
        }
    );
};