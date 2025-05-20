import { useQuery } from "react-query";
import { getAxiosClient } from "../client";

export const useFetchFollowers = (storeId) => {

    const axiosClient = getAxiosClient();

    return useQuery(
        ["storeFollowers", storeId],
        async () => {
            console.log('line8, storeId:', storeId);
            const { data } = await axiosClient.get(`/stores/${storeId}/followers`);
            console.log('data:', data);
            return data.followers;
        },
        {
            enabled: !!storeId, // Only fetch if storeId exists
            staleTime: 5 * 60 * 1000, // 5 minutes
        }
    );
};