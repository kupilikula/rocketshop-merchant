// src/api/mutations/useSelectStore.js

import { useMutation } from "react-query";
import { getAxiosClient } from "../client";
import { setStore } from "../../store/storeSlice";
import { setStoreSettings } from "../../store/storeSettingsSlice";
import {getDashboardPath} from "../../utils/getPathUtils";

export const useSelectStore = (dispatch, router) => {
    const axiosClient = getAxiosClient();
    return useMutation({
        mutationFn: async ( { store, noRedirect = false}) => {
            const res = await axiosClient.get(`/stores/${store.storeId}/getStoreSettings`);
            return { store, settings: res.data.settings, noRedirect };
        },
        onSuccess: ({ store, settings, noRedirect }) => {
            dispatch(setStore(store));
            dispatch(setStoreSettings(settings));
            if (!noRedirect) {
                router.push(getDashboardPath());
            }
        },
        onError: (error) => {
            console.error("Failed to select store:", error);
            // Optionally: show toast/snackbar
        },
    });
};