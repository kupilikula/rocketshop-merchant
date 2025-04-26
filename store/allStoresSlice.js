import { createSlice } from "@reduxjs/toolkit";
import {RESET_ALL} from "./actions/resetAll";

const initialState = {
    stores: [],
};

const allStoresSlice = createSlice({
    name: "stores",
    initialState,
    reducers: {
        setAllStores: (state, action) => {
            return {...state, ...action.payload};
        },
        clearAllStores: (state, action) => {
            return {...initialState};
        },
    },
    extraReducers: (builder) => {
        builder.addCase(RESET_ALL, () => initialState);
    },

});

export const {
    setAllStores,
    clearAllStores
} = allStoresSlice.actions;

export default allStoresSlice.reducer;
