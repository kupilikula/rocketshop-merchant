import { useMutation, useQueryClient } from "react-query";
import axiosClient from "../client";

export const useReorderCollectionProducts = (storeId, collectionId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (products) => {
            const productOrders = products.map((product, index) => ({
                productId: product.productId,
                displayOrder: index + 1, // 1-based order
            }));
            await axiosClient.patch(`/stores/${storeId}/collections/${collectionId}/reorderProducts`, {
                productOrders,
            });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["collection", collectionId]);
            },
        }
    );
};