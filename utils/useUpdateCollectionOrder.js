import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

/**
 * Update the order of collections in the backend.
 */
export const useUpdateCollectionOrder = (storeId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (collections) => {
            // Transform the data into the expected format
            const collectionOrders = collections.map((collection, index) => ({
                collectionId: collection.collectionId,
                displayOrder: index + 1, // Display order starts from 1
            }));

            await axios.patch(`/api/merchants/stores/${storeId}/collections/reorder`, {
                collectionOrders,
            });
        },
        {
            onSuccess: () => {
                // Invalidate the collections query to refetch the updated list
                queryClient.invalidateQueries("collections");
            },
        }
    );
};