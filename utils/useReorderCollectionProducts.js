import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

export const useReorderCollectionProducts = (collectionId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (products) => {
            const productOrders = products.map((product, index) => ({
                productId: product.productId,
                displayOrder: index + 1, // 1-based order
            }));
            await axios.patch(`/api/collections/${collectionId}/reorder`, {
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