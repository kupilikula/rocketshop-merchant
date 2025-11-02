// api/hooks/useAddShippingRule.js
import { useMutation, useQueryClient } from 'react-query';
import { getAxiosClient } from '../client';

export const useAddShippingRule = (storeId) => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();

    return useMutation(
        async (data) => {
            const response = await axiosClient.post(`/stores/${storeId}/shipping/rules`, data);
            return response.data;
        },
        {
            onSuccess: (_, { storeId }) => {
                queryClient.invalidateQueries(['shippingRules', storeId]);
            },
        }
    );
};