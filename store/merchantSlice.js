import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  merchantId: "61c6f62d-27d3-44be-9eae-d34d95f94e32",
  merchantName: null,
  merchantPhone: null,
  merchantRole: null,
};

const merchantSlice = createSlice({
  name: "merchant",
  initialState,
  reducers: {
    setMerchant: (state, action) => {
        return action.payload;
      }
    },
    logoutMerchant: () => {
      console.log("resetting: ", { ...initialState });
      return { ...initialState };
    },
});

export const {
    setMerchant,
    logoutMerchant
} = merchantSlice.actions;

export default merchantSlice.reducer;
