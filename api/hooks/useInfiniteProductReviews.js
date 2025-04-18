// hooks/useInfiniteProductReviews.ts
import { useInfiniteQuery } from "react-query";
import axiosClient from "../client";

export function useInfiniteProductReviews(
    storeId,
    productId,
    options = {}
) {
    const {
        sort = "latest",
        rating,
        hasTextOnly,
        limit = 10,
    } = options;

    return useInfiniteQuery({
        queryKey: ["product_reviews", storeId, productId, sort, rating, hasTextOnly],
        queryFn: async ({ pageParam = 0 }) => {
            const res = await axiosClient.get(`/stores/${storeId}/products/${productId}/getAllReviews`, {
                params: {
                    limit,
                    offset: pageParam,
                    sort,
                    rating,
                    hasTextOnly,
                },
            });
            return res.data;
        },
        getNextPageParam: (lastPage) => {
            const { offset, limit, filteredCount } = lastPage.pagination;
            const nextOffset = offset + limit;
            return nextOffset < filteredCount ? nextOffset : undefined;
        },
        enabled: !!productId && !!storeId,
    });
}