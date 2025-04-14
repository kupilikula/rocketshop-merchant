import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  storeId: null,
    storeName: null,
    storeLogoImage: null,
    storeDescription: null,
    storeHandle: null,
    storeTags: null,
    merchantRole: null,
    isActive: null,
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
      setStore: (state, action) => {
          return {...state, ...action.payload};
      },
      clearStore: (state, action) => {
          return {...initialState};
      },
  }
});

export const {
    setStore,
    clearStore
} = storeSlice.actions;

export default storeSlice.reducer;
