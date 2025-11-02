import { useMutation, useQueryClient } from "react-query";
import { getAxiosClient } from "../client";

export const useReorderCollectionProducts = (storeId, collectionId) => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    return useMutation(
        async (products) => {
            const productOrders = products.map((product, index) => ({
                productId: product.productId,
                displayOrder: index + 1, // 1-based order
            }));
            await axiosClient.patch(`/stores/${storeId}/collections/${collectionId}/reorder-products`, {
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