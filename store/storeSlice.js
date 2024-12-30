import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  storeId: 'd9117fb1-135b-4fab-8e26-21082c1f59ea',
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
