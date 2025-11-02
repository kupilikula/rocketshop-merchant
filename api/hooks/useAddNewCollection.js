import { useMutation, useQueryClient } from "react-query";
import { getAxiosClient } from "../client";

export const useAddNewCollection = (storeId) => {
    const queryClient = useQueryClient();
    const axiosClient = getAxiosClient();

    return useMutation(
        async (newCollection) => {
            await axiosClient.post(`/stores/${storeId}/collections`, newCollection);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["collections"]);
            },
        }
    );
};