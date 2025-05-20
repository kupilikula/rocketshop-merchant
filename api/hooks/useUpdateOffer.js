import {useMutation, useQueryClient} from "react-query";
import { getAxiosClient } from "../client";

export const useUpdateOffer = (storeId, offerId) => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();
    return useMutation({
        mutationFn: async (updatedFields) => {
            const { data } = await axiosClient.patch(`/stores/${storeId}/offers/${offerId}/updateOffer`, updatedFields);
            console.log('data:', data);
            return data;
        },
        onSuccess: () => {
            // Invalidate the specific offer query to refetch updated data
            queryClient.invalidateQueries(["offer", storeId, offerId]);
            queryClient.invalidateQueries(["offers", storeId]);
        },
        onError: (error) => {
            console.error("Error updating offer:", error);
        }
    });
};