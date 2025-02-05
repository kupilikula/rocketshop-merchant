import {useMutation, useQueryClient} from "react-query";
import axiosClient from "../client";

export const useUpdateOffer = (storeId, offerId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updatedFields) => {
            const { data } = await axiosClient.patch(`/stores/${storeId}/offers/${offerId}/updateOffer`, updatedFields);
            console.log('data:', data);
            return data;
        },
        onSuccess: () => {
            // Invalidate the specific offer query to refetch updated data
            queryClient.invalidateQueries(["offer", storeId, offerId]);
        },
        onError: (error) => {
            console.error("Error updating offer:", error);
        }
    });
};