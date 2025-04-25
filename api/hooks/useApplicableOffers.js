import { useQuery } from "react-query";
import axiosClient from "../client";

export const useApplicableOffers = ({storeId, productId, collectionId, storeWide}) => {
    let enabled = true;
    let params;
    let queryKey;
    if (productId) {
        params = {storeId, productId}
        queryKey = ['applicableOffers-product', productId];
    } else if (collectionId) {
        params = {storeId, collectionId}
        queryKey = ['applicableOffers-collection', collectionId];
    } else if (storeWide) {
        params = {storeId, storeWide: true}
        queryKey = ['applicableOffers-storeWide'];
    } else {
        enabled = false;
    }

    return useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await axiosClient.get('/getApplicableOffers', {params: params});
            return data;
        },
        enabled: !!storeId && enabled
    });
};