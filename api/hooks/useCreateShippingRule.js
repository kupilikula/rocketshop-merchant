import { useMutation } from 'react-query';
import axiosClient from '../client'; // your pre-configured Axios instance

export const useCreateShippingRule = (storeId) => {
    return useMutation(async (shippingRuleData) => {
        const response = await axiosClient.post(`/stores/${storeId}/shipping/addNewRule`, shippingRuleData);
        return response.data;
    });
};