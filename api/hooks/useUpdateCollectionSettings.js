import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

export const useUpdateCollectionSettings = (storeId, collectionId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (settings) => {
            await axios.patch(`/stores/${storeId}/collections/${collectionId}`, settings);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["collection", collectionId]);
            },
        }
    );
};