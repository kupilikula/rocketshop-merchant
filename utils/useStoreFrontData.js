import { useQuery } from "react-query";
import axios from "axios";

export const useStoreFrontData = (storeId) => {
    return useQuery(
        ["storeFrontData", storeId],
        async () => {
            const { data } = await axios.get(`/api/stores/${storeId}/storefront`);
            return data;
        },
        {
            enabled: !!storeId, // Only fetch when storeId is available
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        }
    );
};