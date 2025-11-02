import {useMutation, useQueryClient} from "react-query";
import { getAxiosClient } from "../client";

export const useDeleteOffer = (storeId, offerId) => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();

    return useMutation({
        mutationFn: async (updatedFields) => {
            const { data } = await axiosClient.delete(`/stores/${storeId}/offers/${offerId}`);
            console.log('data:', data);
            return data;
        },
        onSuccess: () => {
            // Invalidate the specific offer query to refetch updated data
            queryClient.invalidateQueries(["offer", storeId, offerId]);
            queryClient.invalidateQueries(["offers", storeId]);
        },
        onError: (error) => {
            console.error("Error deleting offer:", error);
        }
    });
};