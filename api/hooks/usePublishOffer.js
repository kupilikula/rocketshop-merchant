import {useMutation, useQueryClient} from "react-query";
import axiosClient from "../client";

export const usePublishOffer = (storeId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newOffer) => {
            const { data } = await axiosClient.post(`/stores/${storeId}/offers/createNewOffer`, newOffer);
            console.log('data:', data);
            return data;
        },
        onSuccess: () => {
            // Invalidate the specific offer query to refetch updated data
            queryClient.invalidateQueries(["offers"]);
        },
        onError: (error) => {
            console.error("Error publishing offer:", error);
        }
    });
};