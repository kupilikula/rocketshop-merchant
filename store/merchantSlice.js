import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  merchantId: null,
  merchantName: null,
  merchantPhone: null,
  merchantRole: null,
};

const merchantSlice = createSlice({
  name: "merchant",
  initialState,
  reducers: {
    setMerchant: (state, action) => {
        return {...state, ...action.payload};
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
