import { createSlice } from "@reduxjs/toolkit";

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
    }
});

export const {
    setAllStores,
    clearAllStores
} = allStoresSlice.actions;

export default allStoresSlice.reducer;
