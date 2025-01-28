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
    ,
    clearMerchant: (state, action) => {
      console.log('clearing merchant');
      console.log("resetting: ", {...initialState});
      return {...initialState};
    },
  }
});

export const {
    setMerchant,
    clearMerchant
} = merchantSlice.actions;

export default merchantSlice.reducer;
