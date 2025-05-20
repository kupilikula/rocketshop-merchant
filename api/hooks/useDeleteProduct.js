import {useMutation, useQueryClient} from 'react-query';
import { getAxiosClient } from '../client'; // your configured axios instance

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();

    return useMutation(async ({ storeId, productId }) => {
        const response = await axiosClient.delete(`/stores/${storeId}/products/${productId}/deleteProduct`);
        return response.data;
    })
}