import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  storeId: null,
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setStore: (state, action) => {
        return action.payload;
      }
    },
    clearStore: () => {
      return { ...initialState };
    },
});

export const {
    setMerchant,
    logoutMerchant
} = storeSlice.actions;

export default storeSlice.reducer;
