import { useQuery } from "react-query";
import axios from "axios";

/**
 * Fetch details of a specific product.
 * @param {string} storeId - The ID of the store.
 * @param {string} productId - The ID of the product.
 */
export const useStoreProduct = (storeId, productId) => {
    return useQuery(
        ["merchantProduct", storeId, productId],
        async () => {
            const response = await axios.get(
                `/api/merchants/stores/${storeId}/products/${productId}`
            );
            return response.data;
        },
        {
            enabled: !!storeId && !!productId, // Fetch only if storeId and productId are provided
            staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
        }
    );
};