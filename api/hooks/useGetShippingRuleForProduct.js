import { useQuery } from 'react-query';
import { getAxiosClient } from '../client';

const fetchShippingRuleForProduct = async (productId, storeId) => {
    const axiosClient = getAxiosClient();
    if (!productId) throw new Error('Missing productId');

    const response = await axiosClient.get(`/stores/${storeId}/shipping/getRuleForProduct?productId=${productId}`);
    return response.data;
};

export const useGetShippingRuleForProduct = (productId, storeId, options = {}) => {
    console.log('useGetShippingRuleForProduct', productId, storeId);
    return useQuery({
        queryKey: ['shippingRuleForProduct', productId],
        queryFn: () => fetchShippingRuleForProduct(productId, storeId),
        enabled: !!productId && !!storeId,
        ...options,
    });
};