import { createSlice } from "@reduxjs/toolkit";

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
  }
});

export const {
    setStoreSettings,
    clearStoreSettings
} = storeSettingsSlice.actions;

export default storeSettingsSlice.reducer;
