import { createSlice } from "@reduxjs/toolkit";
import {RESET_ALL} from "./actions/resetAll";

const initialState = {
  defaultGstRate: null,
    defaultGstInclusive: null,
};

const storeSettingsSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
      setStoreSettings: (state, action) => {
          return {...state, ...action.payload};
      },
      clearStoreSettings: (state, action) => {
          return {...initialState};
      },
  },
    extraReducers: (builder) => {
        builder.addCase(RESET_ALL, () => initialState);
    },
});

export const {
    setStoreSettings,
    clearStoreSettings
} = storeSettingsSlice.actions;

export default storeSettingsSlice.reducer;
