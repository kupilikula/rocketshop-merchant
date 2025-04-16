// src/api/mutations/useSelectStore.js

import { useMutation } from "react-query";
import axiosClient from "../client";
import { setStore } from "../../store/storeSlice";
import { setStoreSettings } from "../../store/storeSettingsSlice";

export const useSelectStore = (dispatch, router) => {
    return useMutation({
        mutationFn: async (store) => {
            const res = await axiosClient.get(`/stores/${store.storeId}/getStoreSettings`);
            return { store, settings: res.data.settings };
        },
        onSuccess: ({ store, settings }) => {
            dispatch(setStore(store));
            dispatch(setStoreSettings(settings));
            router.push("/Main/(tabs)/Dashboard");
        },
        onError: (error) => {
            console.error("Failed to select store:", error);
            // Optionally: show toast/snackbar
        },
    });
};