import { useMutation, useQueryClient } from 'react-query';
import { getAxiosClient } from '../client';

export const useUpdateOrderStatus = (storeId, orderId) => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    return useMutation({
        mutationFn: async (newStatus) => {
            const response = await axiosClient.patch(
                `/stores/${storeId}/orders/${orderId}/updateStatus`,
                { newStatus }
            );
            return response.data;
        },
        onSuccess: () => {
            // Invalidate order details query so it's refetched
            queryClient.invalidateQueries(['order', orderId]);
            // Optionally also invalidate orders list
            queryClient.invalidateQueries(['orders', storeId]);
        },
        onError: (error) => {
            console.error("Failed to update order status:", error);
        },
    });
};