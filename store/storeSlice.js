import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  storeId: null,
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setStore: (state, action) => {
        return {...state, ...action.payload};
      }
    },
    clearStore: () => {
      return { ...initialState };
    },
});

export const {
    setStore,
    clearStore
} = storeSlice.actions;

export default storeSlice.reducer;
