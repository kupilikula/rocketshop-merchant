import { useMutation, useQueryClient } from "react-query";
import axiosClient from "../client";

export const useAddNewCollection = (storeId) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (newCollection) => {
            await axiosClient.post(`/stores/${storeId}/collections/addNewCollection`, newCollection);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["collections"]);
            },
        }
    );
};