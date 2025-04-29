import {useMutation, useQueryClient} from 'react-query';
import axiosClient from '../client'; // your configured axios instance

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation(async ({ storeId, productId }) => {
        const response = await axiosClient.delete(`/stores/${storeId}/products/${productId}/deleteProduct`);
        return response.data;
    })
}