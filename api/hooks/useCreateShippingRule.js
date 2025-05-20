import { useMutation } from 'react-query';
import { getAxiosClient } from '../client'; // your pre-configured Axios instance

export const useCreateShippingRule = (storeId) => {
    const axiosClient = getAxiosClient();
    return useMutation(async (shippingRuleData) => {
        const response = await axiosClient.post(`/stores/${storeId}/shipping/addNewRule`, shippingRuleData);
        return response.data;
    });
};