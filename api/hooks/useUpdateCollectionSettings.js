import { useMutation, useQueryClient } from "react-query";
import { getAxiosClient } from "../client";
export const useUpdateCollectionSettings = (storeId, collectionId) => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    return useMutation(
        async (settings) => {
            await axiosClient.patch(`/stores/${storeId}/collections/${collectionId}`, settings);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["collection", collectionId]);
                queryClient.invalidateQueries(["storeFrontData"]);

            },
        }
    );
};