import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

export const useUpdateCollectionSettings = (collectionId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (settings) => {
            await axios.patch(`/api/collections/${collectionId}/settings`, settings);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["collection", collectionId]);
            },
        }
    );
};