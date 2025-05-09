import { createSlice } from "@reduxjs/toolkit";
import {RESET_ALL} from "./actions/resetAll";

const initialState = {
  merchantId: null,
  fullName: null,
  phone: null,
  isPlatformMerchant: null,
};

const merchantSlice = createSlice({
  name: "merchant",
  initialState,
  reducers: {
    setMerchant: (state, action) => {
      return {...state, ...action.payload};
    }
    ,
    clearMerchant: (state, action) => {
      console.log('clearing merchant');
      console.log("resetting: ", {...initialState});
      return {...initialState};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_ALL, () => initialState);
  },

});

export const {
    setMerchant,
    clearMerchant
} = merchantSlice.actions;

export default merchantSlice.reducer;
