import { useInfiniteQuery } from "react-query";
import { getAxiosClient } from "../client";

export const useCustomerOrders = ({ storeId, customerId, limit = 10 }) => {

    const axiosClient = getAxiosClient();

    return useInfiniteQuery({
        queryKey: ["customerOrders", storeId, customerId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await axiosClient.get(`/stores/${storeId}/customers/${customerId}/orders`, {
                params: { page: pageParam, limit },
            });
            return res.data; // { orders, pagination }
        },
        getNextPageParam: (lastPage) => {
            if (lastPage?.pagination?.hasMore) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        enabled: !!storeId && !!customerId,
    });
};