// src/api/hooks/useGetStoreSettings.js

import { useQuery } from "react-query";
import { getAxiosClient } from "../client";

export const useGetStoreSettings = (storeId) => {
    const axiosClient = getAxiosClient();
    return useQuery({
        queryKey: ["storeSettings", storeId],
        queryFn: async () => {
            const res = await axiosClient.get(`/stores/${storeId}/getStoreSettings`);
            return res.data.settings;
        },
        enabled: !!storeId, // Only run if storeId is available
    });
};