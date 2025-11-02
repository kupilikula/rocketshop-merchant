import { useQuery } from "react-query";
import { getAxiosClient } from "../client";

export const fetchStoreFrontData = async (storeId) => {
    const axiosClient = getAxiosClient();
    const response = await axiosClient.get(`/stores/${storeId}/front`);
    return response.data;
};

export const useStoreFrontData = (storeId) => {
    return useQuery(["storeFrontData", storeId], () => fetchStoreFrontData(storeId), {
        enabled: !!storeId, // Ensure the query only runs if storeId exists
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};