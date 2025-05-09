import { createSlice } from "@reduxjs/toolkit";
import {RESET_ALL} from "./actions/resetAll";

const initialState = {
  oauthState: null,
};

const razorpaySlice = createSlice({
  name: "razorpay",
  initialState,
  reducers: {
      setOAuthState: (state, action) => {
          return {...state, oauthState: action.payload};
      },
      clearOAuthState: (state, action) => {
          return {...state, oauthState: null};
      },
  },
    extraReducers: (builder) => {
        builder.addCase(RESET_ALL, () => initialState);
    },
});

export const {
    setOAuthState,
    clearOAuthState
} = razorpaySlice.actions;

export default razorpaySlice.reducer;
